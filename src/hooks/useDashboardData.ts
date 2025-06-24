
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

const buildDateFilter = (selectedMonths: number[], year: number) => {
  if (!selectedMonths || selectedMonths.length === 0) {
    return null;
  }

  const dateConditions = selectedMonths.map(month => {
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
    return { start: startDate, end: endDate };
  });

  return dateConditions;
};

const buildPostgRESTDateFilter = (dateConditions: any[], dateField: string = 'created_at') => {
  if (!dateConditions || dateConditions.length === 0) {
    return '';
  }

  // Build OR conditions for multiple date ranges
  const orConditions = dateConditions.map(condition => 
    `and(${dateField}.gte.${condition.start},${dateField}.lte.${condition.end})`
  ).join(',');

  return `or(${orConditions})`;
};

const fetchDashboardData = async (filters: DashboardFilters, isSuperAdmin: boolean): Promise<DashboardData> => {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  const dateConditions = buildDateFilter(filters.selectedMonths, filters.year);
  
  console.log('Dashboard filters:', filters);
  console.log('Date conditions:', dateConditions);

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
    // Fetch clinics (no date filtering needed)
    console.log('Fetching clinics...');
    let clinicsQuery = supabase.from('clinics').select('*');
    
    if (!isSuperAdmin && userId) {
      clinicsQuery = clinicsQuery.eq('owner_id', userId);
    }
    
    const { data: clinicsData, error: clinicsError } = await clinicsQuery;
    if (clinicsError) throw clinicsError;
    dashboardData.clinics = clinicsData || [];

    // Return early if no clinics selected
    if (filters.clinicIds.length === 0) {
      return dashboardData;
    }

    // Fetch bookings with optimized query
    console.log('Fetching bookings...');
    let bookingsQuery = supabase
      .from('bookings')
      .select('*')
      .in('clinic_id', filters.clinicIds)
      .order('booking_time', { ascending: false });

    if (dateConditions && dateConditions.length > 0) {
      const dateFilter = buildPostgRESTDateFilter(dateConditions, 'booking_time');
      bookingsQuery = bookingsQuery.or(dateFilter);
    }

    const { data: bookingsData, error: bookingsError } = await bookingsQuery;
    if (bookingsError) throw bookingsError;
    dashboardData.bookings = bookingsData || [];

    // Fetch FAQs with optimized query
    console.log('Fetching FAQs...');
    let faqsQuery = supabase
      .from('frequently_asked_questions')
      .select('*')
      .in('clinic_id', filters.clinicIds)
      .order('asked_count', { ascending: false });

    if (dateConditions && dateConditions.length > 0) {
      const dateFilter = buildPostgRESTDateFilter(dateConditions, 'created_at');
      faqsQuery = faqsQuery.or(dateFilter);
    }

    const { data: faqsData, error: faqsError } = await faqsQuery;
    if (faqsError) throw faqsError;
    dashboardData.faqs = faqsData || [];

    // Fetch products with optimized query
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
      `)
      .in('clinic_id', filters.clinicIds);

    if (dateConditions && dateConditions.length > 0) {
      const dateFilter = buildPostgRESTDateFilter(dateConditions, 'created_at');
      productsQuery = productsQuery.or(dateFilter);
    }

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

    // Fetch leads with optimized query
    console.log('Fetching leads...');
    let leadsQuery = supabase
      .from('leads')
      .select('*')
      .in('clinic_id', filters.clinicIds);

    if (dateConditions && dateConditions.length > 0) {
      const dateFilter = buildPostgRESTDateFilter(dateConditions, 'created_at');
      leadsQuery = leadsQuery.or(dateFilter);
    }

    const { data: leadsData, error: leadsError } = await leadsQuery;
    if (leadsError) throw leadsError;
    dashboardData.leads = leadsData || [];

    // Fetch sales with optimized query
    console.log('Fetching sales...');
    let salesQuery = supabase
      .from('sales')
      .select('*')
      .in('clinic_id', filters.clinicIds);

    if (dateConditions && dateConditions.length > 0) {
      const dateFilter = buildPostgRESTDateFilter(dateConditions, 'created_at');
      salesQuery = salesQuery.or(dateFilter);
    }

    const { data: salesData, error: salesError } = await salesQuery;
    if (salesError) throw salesError;
    dashboardData.sales = salesData || [];

    // Fetch costs with optimized query
    console.log('Fetching costs...');
    let costsQuery = supabase
      .from('costs')
      .select('*')
      .in('clinic_id', filters.clinicIds);

    if (dateConditions && dateConditions.length > 0) {
      const dateFilter = buildPostgRESTDateFilter(dateConditions, 'created_at');
      costsQuery = costsQuery.or(dateFilter);
    }

    const { data: costsData, error: costsError } = await costsQuery;
    if (costsError) throw costsError;
    dashboardData.costs = costsData || [];

    // Fetch conversations with optimized query
    console.log('Fetching conversations...');
    let conversationsQuery = supabase
      .from('conversations')
      .select('*')
      .in('clinic_id', filters.clinicIds);

    if (dateConditions && dateConditions.length > 0) {
      const dateFilter = buildPostgRESTDateFilter(dateConditions, 'created_at');
      conversationsQuery = conversationsQuery.or(dateFilter);
    }

    const { data: conversationsData, error: conversationsError } = await conversationsQuery;
    if (conversationsError) throw conversationsError;
    dashboardData.conversations = conversationsData || [];

    // Fetch appointments with optimized query
    console.log('Fetching appointments...');
    let appointmentsQuery = supabase
      .from('appointments')
      .select('*')
      .in('clinic_id', filters.clinicIds);

    if (dateConditions && dateConditions.length > 0) {
      const dateFilter = buildPostgRESTDateFilter(dateConditions, 'scheduled_at');
      appointmentsQuery = appointmentsQuery.or(dateFilter);
    }

    const { data: appointmentsData, error: appointmentsError } = await appointmentsQuery;
    if (appointmentsError) throw appointmentsError;
    dashboardData.appointments = appointmentsData || [];

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
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
    queryKey: ["dashboard-enhanced", filters.appliedFilters, isSuperAdmin],
    queryFn: () => {
      const filtersToUse = filters.appliedFilters || {
        clinicIds: filters.clinicIds,
        selectedMonths: filters.selectedMonths,
        year: filters.year,
        pendingChanges: false
      };
      return fetchDashboardData(filtersToUse, isSuperAdmin);
    },
    enabled: (filters.appliedFilters?.clinicIds.length || 0) > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
