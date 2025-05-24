
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

const fetchDashboardDataRecursively = async (filters: DashboardFilters): Promise<DashboardData> => {
  const promises = [];
  
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

        const year = new Date().getFullYear();
        const month = parseInt(filters.month);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        return query
          .gte('booking_time', startDate.toISOString())
          .lte('booking_time', endDate.toISOString());
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

        return query;
      }
    },
    {
      name: 'clinics',
      query: () => supabase
        .from('clinics')
        .select('*')
        .eq('owner_id', (supabase.auth.getUser().then(u => u.data.user?.id)))
    },
    {
      name: 'products',
      query: () => {
        let query = supabase.from('products').select('*');
        if (filters.clinicIds.length > 0) {
          query = query.in('clinic_id', filters.clinicIds);
        }
        return query;
      }
    },
    {
      name: 'leads',
      query: () => {
        let query = supabase.from('leads').select('*');
        if (filters.clinicIds.length > 0) {
          query = query.in('clinic_id', filters.clinicIds);
        }
        return query;
      }
    },
    {
      name: 'sales',
      query: () => {
        let query = supabase.from('sales').select('*');
        if (filters.clinicIds.length > 0) {
          query = query.in('clinic_id', filters.clinicIds);
        }
        return query;
      }
    },
    {
      name: 'costs',
      query: () => {
        let query = supabase.from('costs').select('*');
        if (filters.clinicIds.length > 0) {
          query = query.in('clinic_id', filters.clinicIds);
        }
        return query;
      }
    },
    {
      name: 'conversations',
      query: () => {
        let query = supabase.from('conversations').select('*');
        if (filters.clinicIds.length > 0) {
          query = query.in('clinic_id', filters.clinicIds);
        }
        return query;
      }
    },
    {
      name: 'appointments',
      query: () => {
        let query = supabase.from('appointments').select('*');
        if (filters.clinicIds.length > 0) {
          query = query.in('clinic_id', filters.clinicIds);
        }
        return query;
      }
    }
  ];

  // Execute all queries recursively using Promise.all for parallel execution
  const executeQueriesRecursively = async (queryList: typeof queries, index = 0): Promise<any[]> => {
    if (index >= queryList.length) {
      return [];
    }

    const currentQuery = queryList[index];
    const { data, error } = await currentQuery.query();
    
    if (error) {
      console.error(`Error fetching ${currentQuery.name}:`, error);
      throw error;
    }

    // Recursive call for the next query
    const remainingResults = await executeQueriesRecursively(queryList, index + 1);
    
    return [{ name: currentQuery.name, data: data || [] }, ...remainingResults];
  };

  // For better performance, we'll use Promise.all instead of true recursion
  const results = await Promise.all(
    queries.map(async (queryDef) => {
      try {
        const { data, error } = await queryDef.query();
        if (error) {
          console.error(`Error fetching ${queryDef.name}:`, error);
          throw error;
        }
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
    if (result.name in dashboardData) {
      (dashboardData as any)[result.name] = result.data;
    }
  });

  return dashboardData;
};

export const useDashboardData = (filters: DashboardFilters) => {
  return useQuery({
    queryKey: ["dashboard-unified", filters],
    queryFn: () => fetchDashboardDataRecursively(filters),
    enabled: filters.clinicIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
