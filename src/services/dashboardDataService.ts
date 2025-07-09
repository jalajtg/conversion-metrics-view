import { supabase } from "@/integrations/supabase/client";
import type { DashboardFilters } from "@/types/dashboard";
import { buildDateFilter, buildPostgRESTDateFilter } from "@/utils/dashboardFilters";
import { automationToProductCategoryMap } from "@/constants/automationMapping";

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

export const fetchDashboardData = async (filters: DashboardFilters, isSuperAdmin: boolean): Promise<DashboardData> => {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  const dateConditions = buildDateFilter(filters.selectedMonths, filters.year);
  
  console.log('Dashboard filters:', filters);
  console.log('Date conditions:', dateConditions);
  console.log('Is Super Admin:', isSuperAdmin);

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
    let clinicsQuery = supabase.from('clinics').select('*').range(0, 999999); // Increased range
    
    if (!isSuperAdmin && userId) {
      clinicsQuery = clinicsQuery.eq('owner_id', userId);
    }
    
    const { data: clinicsData, error: clinicsError } = await clinicsQuery;
    if (clinicsError) throw clinicsError;
    dashboardData.clinics = clinicsData || [];

    // For super admin, if no clinics are selected, fetch all data
    // For regular users, return early if no clinics selected
    if (!isSuperAdmin && filters.clinicIds.length === 0) {
      return dashboardData;
    }

    // Fetch bookings with optimized query
    console.log('Fetching bookings...');
    let bookingsQuery = supabase
      .from('bookings')
      .select('*')
      .order('booking_time', { ascending: false })
      .range(0, 999999); // Increased range

    // Apply clinic filter only if clinics are selected AND not super admin, OR if regular user
    if (!isSuperAdmin) {
      // Regular users must filter by their selected clinics
      if (filters.clinicIds.length > 0) {
        bookingsQuery = bookingsQuery.in('clinic_id', filters.clinicIds);
      }
    } else {
      // Super admin: only filter by clinics if specific clinics are selected
      if (filters.clinicIds.length > 0) {
        bookingsQuery = bookingsQuery.in('clinic_id', filters.clinicIds);
      }
      // If no clinics selected as super admin, fetch ALL bookings
    }

    if (dateConditions && dateConditions.length > 0) {
      if (dateConditions.length === 1) {
        // Only one range (whole year or one month): use gte/lte
        const { start, end } = dateConditions[0];
        bookingsQuery = bookingsQuery.gte('booking_time', start).lte('booking_time', end);
      } else {
        // Multiple months: use or
        const dateFilter = buildPostgRESTDateFilter(dateConditions, 'booking_time');
        bookingsQuery = bookingsQuery.or(dateFilter);
      }
    }

    const { data: bookingsData, error: bookingsError } = await bookingsQuery;
    if (bookingsError) throw bookingsError;
    dashboardData.bookings = bookingsData || [];
    console.log('Bookings data:', bookingsData?.length, 'bookings found');

    // Fetch FAQs with optimized query
    console.log('Fetching FAQs...');
    let faqsQuery = supabase
      .from('frequently_asked_questions')
      .select('*')
      .order('asked_count', { ascending: false })
      .range(0, 999999); // Increased range

    // Apply same logic for FAQs
    if (!isSuperAdmin) {
      if (filters.clinicIds.length > 0) {
        faqsQuery = faqsQuery.in('clinic_id', filters.clinicIds);
      }
    } else {
      if (filters.clinicIds.length > 0) {
        faqsQuery = faqsQuery.in('clinic_id', filters.clinicIds);
      }
    }

    if (dateConditions && dateConditions.length > 0) {
      if (dateConditions.length === 1) {
        const { start, end } = dateConditions[0];
        faqsQuery = faqsQuery.gte('created_at', start).lte('created_at', end);
      } else {
        const dateFilter = buildPostgRESTDateFilter(dateConditions, 'created_at');
        faqsQuery = faqsQuery.or(dateFilter);
      }
    }

    const { data: faqsData, error: faqsError } = await faqsQuery;
    if (faqsError) throw faqsError;
    dashboardData.faqs = faqsData || [];

    // Fetch products with month filtering
    console.log('Fetching products...');
    let productsQuery = supabase
      .from('clinic_product_categories')
      .select(`
        id,
        price,
        clinic_id,
        created_at,
        month,
        product_category:product_category_id (
          id,
          name,
          description
        )
      `)
      .range(0, 999999); // Increased range

    // Also fetch old products table for mapping leads
    let oldProductsQuery = supabase
      .from('products')
      .select('*')
      .range(0, 999999);

    // Apply same logic for products
    if (!isSuperAdmin) {
      if (filters.clinicIds.length > 0) {
        productsQuery = productsQuery.in('clinic_id', filters.clinicIds);
        oldProductsQuery = oldProductsQuery.in('clinic_id', filters.clinicIds);
      }
    } else {
      if (filters.clinicIds.length > 0) {
        productsQuery = productsQuery.in('clinic_id', filters.clinicIds);
        oldProductsQuery = oldProductsQuery.in('clinic_id', filters.clinicIds);
      }
    }

    // Filter by selected months for products - this is key for month filtering
    if (filters.selectedMonths && filters.selectedMonths.length > 0 && filters.selectedMonths.length < 12) {
      productsQuery = productsQuery.in('month', filters.selectedMonths);
    }

    const [{ data: productsData, error: productsError }, { data: oldProductsData, error: oldProductsError }] = await Promise.all([
      productsQuery,
      oldProductsQuery
    ]);
    
    if (productsError) throw productsError;
    if (oldProductsError) throw oldProductsError;
    
    console.log('Products data:', productsData?.length);
    console.log('Old products data:', oldProductsData?.length);
    
    // Create mapping from old products to new clinic_product_categories
    const oldProductsMap = new Map(oldProductsData?.map(p => [p.id, p]) || []);
    
    dashboardData.products = (productsData || []).map((item: any) => ({
      id: item.id,
      name: item.product_category?.name || 'Unknown Product',
      description: item.product_category?.description || '',
      price: Number(item.price),
      clinic_id: item.clinic_id,
      created_at: item.created_at,
      month: item.month,
      // Add old product mapping for leads (by name matching)
      oldProductIds: oldProductsData?.filter(op => 
        op.name === item.product_category?.name && op.clinic_id === item.clinic_id
      ).map(op => op.id) || [],
      // Add automation codes that should map to this product category
      automationCodes: Object.keys(automationToProductCategoryMap).filter(code => 
        automationToProductCategoryMap[code] === item.product_category?.name
      )
    }));

    // Fetch leads with optimized query
    console.log('Fetching leads...');
    let leadsQuery = supabase
      .from('leads')
      .select('*')
      .range(0, 999999); // Increased range

    // Apply same logic for leads
    if (!isSuperAdmin) {
      if (filters.clinicIds.length > 0) {
        leadsQuery = leadsQuery.in('clinic_id', filters.clinicIds);
      }
    } else {
      if (filters.clinicIds.length > 0) {
        leadsQuery = leadsQuery.in('clinic_id', filters.clinicIds);
      }
    }

    if (dateConditions && dateConditions.length > 0) {
      if (dateConditions.length === 1) {
        const { start, end } = dateConditions[0];
        leadsQuery = leadsQuery.gte('created_at', start).lte('created_at', end);
      } else {
        const dateFilter = buildPostgRESTDateFilter(dateConditions, 'created_at');
        leadsQuery = leadsQuery.or(dateFilter);
      }
    }

    const { data: leadsData, error: leadsError } = await leadsQuery;
    if (leadsError) throw leadsError;
    dashboardData.leads = leadsData || [];
    console.log('Leads data:', leadsData?.length, 'leads found');

    // Fetch sales with optimized query
    console.log('Fetching sales...');
    let salesQuery = supabase
      .from('sales')
      .select('*')
      .range(0, 999999); // Increased range

    // Apply same logic for sales
    if (!isSuperAdmin) {
      if (filters.clinicIds.length > 0) {
        salesQuery = salesQuery.in('clinic_id', filters.clinicIds);
      }
    } else {
      if (filters.clinicIds.length > 0) {
        salesQuery = salesQuery.in('clinic_id', filters.clinicIds);
      }
    }

    if (dateConditions && dateConditions.length > 0) {
      if (dateConditions.length === 1) {
        const { start, end } = dateConditions[0];
        salesQuery = salesQuery.gte('created_at', start).lte('created_at', end);
      } else {
        const dateFilter = buildPostgRESTDateFilter(dateConditions, 'created_at');
        salesQuery = salesQuery.or(dateFilter);
      }
    }

    const { data: salesData, error: salesError } = await salesQuery;
    if (salesError) throw salesError;
    dashboardData.sales = salesData || [];

    // Fetch costs with optimized query
    console.log('Fetching costs...');
    let costsQuery = supabase
      .from('costs')
      .select('*')
      .range(0, 999999); // Increased range

    // Apply same logic for costs
    if (!isSuperAdmin) {
      if (filters.clinicIds.length > 0) {
        costsQuery = costsQuery.in('clinic_id', filters.clinicIds);
      }
    } else {
      if (filters.clinicIds.length > 0) {
        costsQuery = costsQuery.in('clinic_id', filters.clinicIds);
      }
    }

    if (dateConditions && dateConditions.length > 0) {
      if (dateConditions.length === 1) {
        const { start, end } = dateConditions[0];
        costsQuery = costsQuery.gte('created_at', start).lte('created_at', end);
      } else {
        const dateFilter = buildPostgRESTDateFilter(dateConditions, 'created_at');
        costsQuery = costsQuery.or(dateFilter);
      }
    }

    const { data: costsData, error: costsError } = await costsQuery;
    if (costsError) throw costsError;
    dashboardData.costs = costsData || [];

    // Fetch conversations with optimized query
    console.log('Fetching conversations...');
    let conversationsQuery = supabase
      .from('conversations')
      .select('*')
      .range(0, 999999); // Increased range

    // Apply same logic for conversations
    if (!isSuperAdmin) {
      if (filters.clinicIds.length > 0) {
        conversationsQuery = conversationsQuery.in('clinic_id', filters.clinicIds);
      }
    } else {
      if (filters.clinicIds.length > 0) {
        conversationsQuery = conversationsQuery.in('clinic_id', filters.clinicIds);
      }
    }

    if (dateConditions && dateConditions.length > 0) {
      if (dateConditions.length === 1) {
        const { start, end } = dateConditions[0];
        conversationsQuery = conversationsQuery.gte('created_at', start).lte('created_at', end);
      } else {
        const dateFilter = buildPostgRESTDateFilter(dateConditions, 'created_at');
        conversationsQuery = conversationsQuery.or(dateFilter);
      }
    }

    const { data: conversationsData, error: conversationsError } = await conversationsQuery;
    if (conversationsError) throw conversationsError;
    dashboardData.conversations = conversationsData || [];

    // Fetch appointments with optimized query
    console.log('Fetching appointments...');
    let appointmentsQuery = supabase
      .from('appointments')
      .select('*')
      .range(0, 999999); // Increased range

    // Apply same logic for appointments
    if (!isSuperAdmin) {
      if (filters.clinicIds.length > 0) {
        appointmentsQuery = appointmentsQuery.in('clinic_id', filters.clinicIds);
      }
    } else {
      if (filters.clinicIds.length > 0) {
        appointmentsQuery = appointmentsQuery.in('clinic_id', filters.clinicIds);
      }
    }

    if (dateConditions && dateConditions.length > 0) {
      if (dateConditions.length === 1) {
        const { start, end } = dateConditions[0];
        appointmentsQuery = appointmentsQuery.gte('scheduled_at', start).lte('scheduled_at', end);
      } else {
        const dateFilter = buildPostgRESTDateFilter(dateConditions, 'scheduled_at');
        appointmentsQuery = appointmentsQuery.or(dateFilter);
      }
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