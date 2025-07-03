import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  // If all 12 months are selected, just use the year range
  if (selectedMonths && selectedMonths.length === 12) {
    const start = startOfMonth(new Date(year, 0));
    const end = endOfMonth(new Date(year, 11));
    return [{ start: start.toISOString(), end: end.toISOString() }];
  }
  // If no months are selected, filter by the whole year
  if (!selectedMonths || selectedMonths.length === 0) {
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
  return useQuery({
    queryKey: ["bookings", filters],
    queryFn: async (): Promise<Booking[]> => {
      let query = supabase
        .from('bookings')
        .select('*')
        .order('booking_time', { ascending: false });

      // Filter by clinic IDs if specified
      if (filters.clinicIds && filters.clinicIds.length > 0) {
        query = query.in('clinic_id', filters.clinicIds);
      }

      // Build date conditions
      const dateConditions = buildDateFilter(filters.selectedMonths, filters.year);
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

      return data || [];
    },
    enabled: filters.clinicIds.length > 0,
  });
};
