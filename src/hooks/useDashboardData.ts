
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import type { DashboardFilters } from "@/types/dashboard";

interface DashboardData {
  bookings: any[];
  faqs: any[];
  clinics: any[];
  products: any[];
  leads: any[];
  sales: any[];
  costs: any[];
  conversations: any[];
  appointments: any[];
}

const getDateRangesForMonths = (selectedMonths: number[], year: number) => {
  if (!selectedMonths || selectedMonths.length === 0) {
    return null;
  }

  const ranges = selectedMonths.map(month => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    return {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    };
  });

  console.log('Generated date ranges for months:', selectedMonths, 'year:', year, 'ranges:', ranges);
  return ranges;
};

const applyDateFilterToQuery = async (baseQuery: any, dateRanges: any[] | null, dateField: string = 'created_at') => {
  if (!dateRanges || dateRanges.length === 0) {
    console.log('No date ranges provided, returning query as-is');
    return baseQuery;
  }

  console.log(`Applying date filter to field '${dateField}' with ranges:`, dateRanges);

  if (dateRanges.length === 1) {
    // Single date range - use simple gte/lte
    const range = dateRanges[0];
    console.log(`Single range filter: ${dateField} between ${range.start} and ${range.end}`);
    return baseQuery
      .gte(dateField, range.start)
      .lte(dateField, range.end);
  }

  // For multiple date ranges, we need to fetch data for each range and combine
  console.log(`Multiple ranges filter for ${dateField}:`, dateRanges);
  
  const results = [];
  for (const range of dateRanges) {
    console.log(`Fetching data for range: ${range.start} to ${range.end}`);
    const { data, error } = await baseQuery
      .gte(dateField, range.start)
      .lte(dateField, range.end);
    
    if (error) {
      console.error(`Error fetching data for range ${range.start} to ${range.end}:`, error);
      throw error;
    }
    
    if (data && data.length > 0) {
      results.push(...data);
    }
  }
  
  // Remove duplicates based on id
  const uniqueResults = results.filter((item, index, self) => 
    index === self.findIndex(t => t.id === item.id)
  );
  
  console.log(`Combined results from ${dateRanges.length} ranges: ${uniqueResults.length} items`);
  return { data: uniqueResults, error: null };
};

const fetchDashboardDataRecursively = async (filters: DashboardFilters, isSuperAdmin: boolean): Promise<DashboardData> => {
  // Get the current user ID first
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  // Get date ranges for filtering
  const currentYear = filters.year || new Date().getFullYear();
  const dateRanges = getDateRangesForMonths(filters.selectedMonths || [], currentYear);

  console.log('Dashboard filters:', filters);
  console.log('Date ranges for filtering:', dateRanges);
  console.log('Selected clinics:', filters.clinicIds);

  // Initialize dashboard data
  const dashboardData: DashboardData = {
    bookings: [],
    faqs: [],
    clinics: [],
    products: [],
    leads: [],
    sales: [],
    costs: [],
    conversations: [],
    appointments: []
  };

  try {
    // Fetch bookings with date filtering
    console.log('Fetching bookings...');
    let bookingsQuery = supabase
      .from('bookings')
      .select('*')
      .order('booking_time', { ascending: false });

    if (filters.clinicIds.length > 0) {
      console.log('Filtering bookings by clinic IDs:', filters.clinicIds);
      bookingsQuery = bookingsQuery.in('clinic_id', filters.clinicIds);
    }

    if (dateRanges && dateRanges.length > 0) {
      const bookingsResult = await applyDateFilterToQuery(bookingsQuery, dateRanges, 'booking_time');
      if (bookingsResult.data) {
        dashboardData.bookings = bookingsResult.data;
      }
    } else {
      const { data: bookingsData, error: bookingsError } = await bookingsQuery;
      if (bookingsError) throw bookingsError;
      dashboardData.bookings = bookingsData || [];
    }
    console.log('Bookings fetched:', dashboardData.bookings.length);

    // Fetch FAQs with date filtering
    console.log('Fetching FAQs...');
    let faqsQuery = supabase
      .from('frequently_asked_questions')
      .select('*')
      .order('asked_count', { ascending: false });

    if (filters.clinicIds.length > 0) {
      console.log('Filtering FAQs by clinic IDs:', filters.clinicIds);
      faqsQuery = faqsQuery.in('clinic_id', filters.clinicIds);
    }

    if (dateRanges && dateRanges.length > 0) {
      const faqsResult = await applyDateFilterToQuery(faqsQuery, dateRanges, 'created_at');
      if (faqsResult.data) {
        dashboardData.faqs = faqsResult.data;
      }
    } else {
      const { data: faqsData, error: faqsError } = await faqsQuery;
      if (faqsError) throw faqsError;
      dashboardData.faqs = faqsData || [];
    }
    console.log('FAQs fetched:', dashboardData.faqs.length);

    // Fetch clinics (no date filtering needed for clinics)
    console.log('Fetching clinics...');
    let clinicsQuery = supabase.from('clinics').select('*');
    
    if (!isSuperAdmin && userId) {
      clinicsQuery = clinicsQuery.eq('owner_id', userId);
    }
    
    const { data: clinicsData, error: clinicsError } = await clinicsQuery;
    if (clinicsError) throw clinicsError;
    dashboardData.clinics = clinicsData || [];
    console.log('Clinics fetched:', dashboardData.clinics.length);

    // Fetch products with date filtering
    console.log('Fetching products...');
    let productsQuery = supabase
      .from('clinic_product_categories')
      .select(`
        id,
        price,
        clinic_id,
        created_at,
        product_category:product_category_id (
          id,
          name,
          description
        )
      `);
    
    if (filters.clinicIds.length > 0) {
      console.log('Filtering products by clinic IDs:', filters.clinicIds);
      productsQuery = productsQuery.in('clinic_id', filters.clinicIds);
    }

    if (dateRanges && dateRanges.length > 0) {
      const productsResult = await applyDateFilterToQuery(productsQuery, dateRanges, 'created_at');
      if (productsResult.data) {
        dashboardData.products = (productsResult.data || []).map((item: any) => ({
          id: item.id,
          name: item.product_category?.name || 'Unknown Product',
          description: item.product_category?.description || '',
          price: Number(item.price),
          clinic_id: item.clinic_id,
          created_at: item.created_at
        }));
      }
    } else {
      const { data: productsData, error: productsError } = await productsQuery;
      if (productsError) throw productsError;
      dashboardData.products = (productsData || []).map((item: any) => ({
        id: item.id,
        name: item.product_category?.name || 'Unknown Product',
        description: item.product_category?.description || '',
        price: Number(item.price),
        clinic_id: item.clinic_id,
        created_at: item.created_at
      }));
    }
    console.log('Products fetched:', dashboardData.products.length);

    // Fetch leads with date filtering
    console.log('Fetching leads...');
    let leadsQuery = supabase.from('leads').select('*');
    
    if (filters.clinicIds.length > 0) {
      console.log('Filtering leads by clinic IDs:', filters.clinicIds);
      leadsQuery = leadsQuery.in('clinic_id', filters.clinicIds);
    }

    if (dateRanges && dateRanges.length > 0) {
      const leadsResult = await applyDateFilterToQuery(leadsQuery, dateRanges, 'created_at');
      if (leadsResult.data) {
        dashboardData.leads = leadsResult.data;
      }
    } else {
      const { data: leadsData, error: leadsError } = await leadsQuery;
      if (leadsError) throw leadsError;
      dashboardData.leads = leadsData || [];
    }
    console.log('Leads fetched:', dashboardData.leads.length);

    // Fetch sales with date filtering
    console.log('Fetching sales...');
    let salesQuery = supabase.from('sales').select('*');
    
    if (filters.clinicIds.length > 0) {
      console.log('Filtering sales by clinic IDs:', filters.clinicIds);
      salesQuery = salesQuery.in('clinic_id', filters.clinicIds);
    }

    if (dateRanges && dateRanges.length > 0) {
      const salesResult = await applyDateFilterToQuery(salesQuery, dateRanges, 'created_at');
      if (salesResult.data) {
        dashboardData.sales = salesResult.data;
      }
    } else {
      const { data: salesData, error: salesError } = await salesQuery;
      if (salesError) throw salesError;
      dashboardData.sales = salesData || [];
    }
    console.log('Sales fetched:', dashboardData.sales.length);

    // Fetch costs with date filtering
    console.log('Fetching costs...');
    let costsQuery = supabase.from('costs').select('*');
    
    if (filters.clinicIds.length > 0) {
      console.log('Filtering costs by clinic IDs:', filters.clinicIds);
      costsQuery = costsQuery.in('clinic_id', filters.clinicIds);
    }

    if (dateRanges && dateRanges.length > 0) {
      const costsResult = await applyDateFilterToQuery(costsQuery, dateRanges, 'created_at');
      if (costsResult.data) {
        dashboardData.costs = costsResult.data;
      }
    } else {
      const { data: costsData, error: costsError } = await costsQuery;
      if (costsError) throw costsError;
      dashboardData.costs = costsData || [];
    }
    console.log('Costs fetched:', dashboardData.costs.length);

    // Fetch conversations with date filtering
    console.log('Fetching conversations...');
    let conversationsQuery = supabase.from('conversations').select('*');
    
    if (filters.clinicIds.length > 0) {
      console.log('Filtering conversations by clinic IDs:', filters.clinicIds);
      conversationsQuery = conversationsQuery.in('clinic_id', filters.clinicIds);
    }

    if (dateRanges && dateRanges.length > 0) {
      const conversationsResult = await applyDateFilterToQuery(conversationsQuery, dateRanges, 'created_at');
      if (conversationsResult.data) {
        dashboardData.conversations = conversationsResult.data;
      }
    } else {
      const { data: conversationsData, error: conversationsError } = await conversationsQuery;
      if (conversationsError) throw conversationsError;
      dashboardData.conversations = conversationsData || [];
    }
    console.log('Conversations fetched:', dashboardData.conversations.length);

    // Fetch appointments with date filtering
    console.log('Fetching appointments...');
    let appointmentsQuery = supabase.from('appointments').select('*');
    
    if (filters.clinicIds.length > 0) {
      console.log('Filtering appointments by clinic IDs:', filters.clinicIds);
      appointmentsQuery = appointmentsQuery.in('clinic_id', filters.clinicIds);
    }

    if (dateRanges && dateRanges.length > 0) {
      const appointmentsResult = await applyDateFilterToQuery(appointmentsQuery, dateRanges, 'scheduled_at');
      if (appointmentsResult.data) {
        dashboardData.appointments = appointmentsResult.data;
      }
    } else {
      const { data: appointmentsData, error: appointmentsError } = await appointmentsQuery;
      if (appointmentsError) throw appointmentsError;
      dashboardData.appointments = appointmentsData || [];
    }
    console.log('Appointments fetched:', dashboardData.appointments.length);

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Return partially filled data instead of throwing
  }

  console.log('Final dashboard data counts:', {
    bookings: dashboardData.bookings.length,
    faqs: dashboardData.faqs.length,
    clinics: dashboardData.clinics.length,
    products: dashboardData.products.length,
    leads: dashboardData.leads.length,
    sales: dashboardData.sales.length,
    costs: dashboardData.costs.length,
    conversations: dashboardData.conversations.length,
    appointments: dashboardData.appointments.length
  });

  return dashboardData;
};

export const useDashboardData = (filters: DashboardFilters) => {
  const { isSuperAdmin } = useUserRole();
  
  return useQuery({
    queryKey: ["dashboard-unified", filters, isSuperAdmin],
    queryFn: () => fetchDashboardDataRecursively(filters, isSuperAdmin),
    enabled: filters.clinicIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
  });
};
