
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

  return ranges;
};

const applyDateFilter = (query: any, dateRanges: any[] | null, dateField: string = 'created_at') => {
  if (!dateRanges || dateRanges.length === 0) {
    return query;
  }

  // If multiple date ranges, we need to use OR conditions
  if (dateRanges.length === 1) {
    return query
      .gte(dateField, dateRanges[0].start)
      .lte(dateField, dateRanges[0].end);
  }

  // For multiple months, we'll filter in memory after fetching
  // This is a limitation of Supabase's query builder for complex OR conditions
  return query;
};

const filterDataByDateRanges = (data: any[], dateRanges: any[] | null, dateField: string = 'created_at') => {
  if (!dateRanges || dateRanges.length === 0 || !data) {
    return data;
  }

  return data.filter(item => {
    const itemDate = new Date(item[dateField]);
    return dateRanges.some(range => {
      const startDate = new Date(range.start);
      const endDate = new Date(range.end);
      return itemDate >= startDate && itemDate <= endDate;
    });
  });
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

  // Define all queries
  const queries = [
    {
      name: 'bookings',
      query: () => {
        let query = supabase
          .from('bookings')
          .select('*')
          .order('booking_time', { ascending: false });

        if (filters.clinicIds.length > 0) {
          query = query.in('clinic_id', filters.clinicIds);
        }

        // Apply date filter to booking_time
        return applyDateFilter(query, dateRanges, 'booking_time');
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
          query = query.in('clinic_id', filters.clinicIds);
        }

        // Apply date filter
        return applyDateFilter(query, dateRanges);
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
          query = query.in('clinic_id', filters.clinicIds);
        }

        // Apply date filter
        return applyDateFilter(query, dateRanges);
      }
    },
    {
      name: 'leads',
      query: () => {
        let query = supabase.from('leads').select('*');
        if (filters.clinicIds.length > 0) {
          query = query.in('clinic_id', filters.clinicIds);
        }

        // Apply date filter
        return applyDateFilter(query, dateRanges);
      }
    },
    {
      name: 'sales',
      query: () => {
        let query = supabase.from('sales').select('*');
        if (filters.clinicIds.length > 0) {
          query = query.in('clinic_id', filters.clinicIds);
        }

        // Apply date filter
        return applyDateFilter(query, dateRanges);
      }
    },
    {
      name: 'costs',
      query: () => {
        let query = supabase.from('costs').select('*');
        if (filters.clinicIds.length > 0) {
          query = query.in('clinic_id', filters.clinicIds);
        }

        // Apply date filter
        return applyDateFilter(query, dateRanges);
      }
    },
    {
      name: 'conversations',
      query: () => {
        let query = supabase.from('conversations').select('*');
        if (filters.clinicIds.length > 0) {
          query = query.in('clinic_id', filters.clinicIds);
        }

        // Apply date filter
        return applyDateFilter(query, dateRanges);
      }
    },
    {
      name: 'appointments',
      query: () => {
        let query = supabase.from('appointments').select('*');
        if (filters.clinicIds.length > 0) {
          query = query.in('clinic_id', filters.clinicIds);
        }

        // Apply date filter to scheduled_at
        return applyDateFilter(query, dateRanges, 'scheduled_at');
      }
    }
  ];

  // For better performance, we'll use Promise.all instead of true recursion
  const results = await Promise.all(
    queries.map(async (queryDef) => {
      try {
        const { data, error } = await queryDef.query();
        if (error) {
          console.error(`Error fetching ${queryDef.name}:`, error);
          throw error;
        }
        
        // Apply additional date filtering for multiple months (if needed)
        let filteredData = data || [];
        if (dateRanges && dateRanges.length > 1) {
          if (queryDef.name === 'bookings') {
            filteredData = filterDataByDateRanges(filteredData, dateRanges, 'booking_time');
          } else if (queryDef.name === 'appointments') {
            filteredData = filterDataByDateRanges(filteredData, dateRanges, 'scheduled_at');
          } else if (queryDef.name !== 'clinics') {
            filteredData = filterDataByDateRanges(filteredData, dateRanges, 'created_at');
          }
        }
        
        console.log(`Filtered ${queryDef.name} data:`, filteredData.length, 'items');
        return { name: queryDef.name, data: filteredData };
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

  console.log('Final dashboard data:', dashboardData);
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
