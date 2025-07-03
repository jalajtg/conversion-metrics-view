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

// Helper to build date ranges for booking time filtering
const buildBookingDateFilter = (startDate?: string, endDate?: string) => {
  const conditions = [];
  
  if (startDate) {
    conditions.push(`booking_time.gte.${startDate}T00:00:00.000Z`);
  }
  
  if (endDate) {
    conditions.push(`booking_time.lte.${endDate}T23:59:59.999Z`);
  }
  
  return conditions;
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

      // Build booking time date conditions
      if (filters.bookingStartDate || filters.bookingEndDate) {
        const bookingDateConditions = buildBookingDateFilter(filters.bookingStartDate, filters.bookingEndDate);
        
        if (bookingDateConditions.length > 0) {
          if (bookingDateConditions.length === 1) {
            // Single condition
            const condition = bookingDateConditions[0];
            if (condition.includes('.gte.')) {
              const dateValue = condition.split('.gte.')[1];
              query = query.gte('booking_time', dateValue);
            } else if (condition.includes('.lte.')) {
              const dateValue = condition.split('.lte.')[1];
              query = query.lte('booking_time', dateValue);
            }
          } else {
            // Multiple conditions - apply both start and end date
            if (filters.bookingStartDate) {
              query = query.gte('booking_time', `${filters.bookingStartDate}T00:00:00.000Z`);
            }
            if (filters.bookingEndDate) {
              query = query.lte('booking_time', `${filters.bookingEndDate}T23:59:59.999Z`);
            }
          }
        }
      } else {
        // Original date filtering logic for selected months and year
        const dateConditions = buildDateFilter(filters.selectedMonths, filters.year);
        if (filters.year && dateConditions.length > 0) {
          if (dateConditions.length === 1) {
            const { start, end } = dateConditions[0];
            query = query.gte('booking_time', start).lte('booking_time', end);
          } else {
            const dateFilter = buildPostgRESTDateFilter(dateConditions, 'booking_time');
            if (dateFilter) {
              query = query.or(dateFilter);
            }
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
