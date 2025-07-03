
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import type { DashboardFilters } from "@/types/dashboard";
import { startOfMonth, endOfMonth } from 'date-fns';

interface Booking {
  id: string;
  clinic_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  booking_time: string;
  created_at: string;
}

// Helper to build date ranges for selected months/year
const buildDateFilter = (selectedMonths: number[], year: number) => {
  if (!year) return [];
  
  // If no months are selected, filter by the whole year
  if (!selectedMonths || selectedMonths.length === 0) {
    const start = startOfMonth(new Date(year, 0));
    const end = endOfMonth(new Date(year, 11));
    return [{ start: start.toISOString(), end: end.toISOString() }];
  }
  
  // If all 12 months are selected, just use the year range
  if (selectedMonths.length === 12) {
    const start = startOfMonth(new Date(year, 0));
    const end = endOfMonth(new Date(year, 11));
    return [{ start: start.toISOString(), end: end.toISOString() }];
  }
  
  // Otherwise, filter by selected months
  return selectedMonths.map(month => {
    const start = startOfMonth(new Date(year, month - 1));
    const end = endOfMonth(new Date(year, month - 1));
    return { start: start.toISOString(), end: end.toISOString() };
  });
};

// Helper to build PostgREST or filter
const buildPostgRESTDateFilter = (dateConditions: any[], dateField: string = 'booking_time') => {
  if (!dateConditions || dateConditions.length === 0) return '';
  const orConditions = dateConditions.map(condition =>
    `and(${dateField}.gte.${condition.start},${dateField}.lte.${condition.end})`
  ).join(',');
  return `or(${orConditions})`;
};

export const useBookings = (filters: DashboardFilters) => {
  const { isSuperAdmin } = useUserRole();
  
  return useQuery({
    queryKey: ["bookings", filters, isSuperAdmin],
    queryFn: async (): Promise<Booking[]> => {
      console.log('Fetching bookings with filters:', filters, 'isSuperAdmin:', isSuperAdmin);
      
      let query = supabase
        .from('bookings')
        .select('*')
        .order('booking_time', { ascending: false })
        .range(0, 999999); // Increased range to fetch all data

      // Filter by clinic IDs based on user role
      if (!isSuperAdmin) {
        // Regular users must filter by selected clinics
        if (filters.clinicIds && filters.clinicIds.length > 0) {
          query = query.in('clinic_id', filters.clinicIds);
        }
      } else {
        // Super admin: only filter if specific clinics are selected
        if (filters.clinicIds && filters.clinicIds.length > 0) {
          query = query.in('clinic_id', filters.clinicIds);
        }
        // If no clinics selected as super admin, fetch ALL bookings (no clinic filter)
      }

      // Build date conditions
      const dateConditions = buildDateFilter(filters.selectedMonths, filters.year);
      console.log('Date conditions for bookings:', dateConditions);
      
      if (filters.year && dateConditions.length > 0) {
        if (dateConditions.length === 1) {
          // Only one range (whole year or one month): use gte/lte
          const { start, end } = dateConditions[0];
          query = query.gte('booking_time', start).lte('booking_time', end);
        } else {
          // Multiple months: use or
          const dateFilter = buildPostgRESTDateFilter(dateConditions, 'booking_time');
          if (dateFilter) {
            query = query.or(dateFilter);
          }
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching bookings:', error);
        throw error;
      }

      console.log('Bookings fetched:', data?.length || 0);
      return data || [];
    },
    enabled: isSuperAdmin || filters.clinicIds.length > 0,
  });
};
