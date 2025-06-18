
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

const fetchDashboardDataRecursively = async (filters: DashboardFilters, isSuperAdmin: boolean): Promise<DashboardData> => {
  // Get the current user ID first
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

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
