
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

const applyDateFilterToQuery = (query: any, dateRanges: any[] | null, dateField: string = 'created_at') => {
  if (!dateRanges || dateRanges.length === 0) {
    console.log('No date ranges provided, returning query as-is');
    return query;
  }

  console.log(`Applying date filter to field '${dateField}' with ranges:`, dateRanges);

  if (dateRanges.length === 1) {
    // Single date range - use simple gte/lte
    console.log(`Single range filter: ${dateField} between ${dateRanges[0].start} and ${dateRanges[0].end}`);
    return query
      .gte(dateField, dateRanges[0].start)
      .lte(dateField, dateRanges[0].end);
  }

  // Multiple date ranges - use OR conditions
  console.log(`Multiple ranges filter for ${dateField}:`, dateRanges);
  
  // Build OR conditions for multiple date ranges
  const orConditions = dateRanges.map(range => 
    `(${dateField}.gte.${range.start},${dateField}.lte.${range.end})`
  ).join(',');
  
  console.log(`OR conditions string: or(${orConditions})`);
  return query.or(orConditions);
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

  // Define all queries with proper date filtering
  const queries = [
    {
      name: 'bookings',
      query: () => {
        let query = supabase
          .from('bookings')
          .select('*')
          .order('booking_time', { ascending: false });

        if (filters.clinicIds.length > 0) {
          console.log('Filtering bookings by clinic IDs:', filters.clinicIds);
          query = query.in('clinic_id', filters.clinicIds);
        }

        // Apply date filter to booking_time
        return applyDateFilterToQuery(query, dateRanges, 'booking_time');
      }
    },
    {
      name: 'faqs',
      query: () => {
        let query = supabase
          .from('frequently_asked_questions')
          .select('*')
          .order('asked_count', { ascending: false });

        if (filters.clinicIds.length > 0) {
          console.log('Filtering FAQs by clinic IDs:', filters.clinicIds);
          query = query.in('clinic_id', filters.clinicIds);
        }

        // Apply date filter to created_at
        return applyDateFilterToQuery(query, dateRanges, 'created_at');
      }
    },
    {
      name: 'clinics',
      query: () => {
        let query = supabase.from('clinics').select('*');
        
        // For super admin, fetch all clinics, for regular users, only their own
        if (!isSuperAdmin && userId) {
          query = query.eq('owner_id', userId);
        }
        
        // No date filtering for clinics as they don't change based on month/year selection
        return query;
      }
    },
    {
      name: 'products',
      query: () => {
        let query = supabase
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
          query = query.in('clinic_id', filters.clinicIds);
        }

        // Apply date filter to created_at
        return applyDateFilterToQuery(query, dateRanges, 'created_at');
      }
    },
    {
      name: 'leads',
      query: () => {
        let query = supabase.from('leads').select('*');
        
        if (filters.clinicIds.length > 0) {
          console.log('Filtering leads by clinic IDs:', filters.clinicIds);
          query = query.in('clinic_id', filters.clinicIds);
        }

        // Apply date filter to created_at
        return applyDateFilterToQuery(query, dateRanges, 'created_at');
      }
    },
    {
      name: 'sales',
      query: () => {
        let query = supabase.from('sales').select('*');
        
        if (filters.clinicIds.length > 0) {
          console.log('Filtering sales by clinic IDs:', filters.clinicIds);
          query = query.in('clinic_id', filters.clinicIds);
        }

        // Apply date filter to created_at
        return applyDateFilterToQuery(query, dateRanges, 'created_at');
      }
    },
    {
      name: 'costs',
      query: () => {
        let query = supabase.from('costs').select('*');
        
        if (filters.clinicIds.length > 0) {
          console.log('Filtering costs by clinic IDs:', filters.clinicIds);
          query = query.in('clinic_id', filters.clinicIds);
        }

        // Apply date filter to created_at
        return applyDateFilterToQuery(query, dateRanges, 'created_at');
      }
    },
    {
      name: 'conversations',
      query: () => {
        let query = supabase.from('conversations').select('*');
        
        if (filters.clinicIds.length > 0) {
          console.log('Filtering conversations by clinic IDs:', filters.clinicIds);
          query = query.in('clinic_id', filters.clinicIds);
        }

        // Apply date filter to created_at
        return applyDateFilterToQuery(query, dateRanges, 'created_at');
      }
    },
    {
      name: 'appointments',
      query: () => {
        let query = supabase.from('appointments').select('*');
        
        if (filters.clinicIds.length > 0) {
          console.log('Filtering appointments by clinic IDs:', filters.clinicIds);
          query = query.in('clinic_id', filters.clinicIds);
        }

        // Apply date filter to scheduled_at
        return applyDateFilterToQuery(query, dateRanges, 'scheduled_at');
      }
    }
  ];

  // Execute all queries with proper error handling
  const results = await Promise.all(
    queries.map(async (queryDef) => {
      try {
        console.log(`Executing query for ${queryDef.name}...`);
        const { data, error } = await queryDef.query();
        
        if (error) {
          console.error(`Error fetching ${queryDef.name}:`, error);
          throw error;
        }
        
        console.log(`Successfully fetched ${queryDef.name}:`, data?.length || 0, 'items');
        return { name: queryDef.name, data: data || [] };
      } catch (err) {
        console.error(`Failed to fetch ${queryDef.name}:`, err);
        return { name: queryDef.name, data: [] };
      }
    })
  );

  // Transform results into the expected format
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

  results.forEach(result => {
    if (result.name === 'products') {
      // Transform clinic_product_categories data to match Product interface
      dashboardData.products = (result.data || []).map((item: any) => ({
        id: item.id,
        name: item.product_category?.name || 'Unknown Product',
        description: item.product_category?.description || '',
        price: Number(item.price),
        clinic_id: item.clinic_id,
        created_at: item.created_at
      }));
    } else if (result.name in dashboardData) {
      (dashboardData as any)[result.name] = result.data;
    }
  });

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
