
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DashboardFilters } from "@/types/dashboard";

interface Booking {
  id: string;
  clinic_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  booking_time: string;
  created_at: string;
}

export const useBookings = (filters: DashboardFilters) => {
  return useQuery({
    queryKey: ["bookings", filters],
    queryFn: async (): Promise<Booking[]> => {
      let query = supabase
        .from('bookings')
        .select('*')
        .order('booking_time', { ascending: false });

      // Filter by clinic IDs if specified
      // if (filters.clinicIds.length > 0) {
      //   query = query.in('clinic_id', filters.clinicIds);
      // }

      // // Filter by month and year
      // const year = new Date().getFullYear();
      // const month = parseInt(filters.month);
      // const startDate = new Date(year, month - 1, 1);
      // const endDate = new Date(year, month, 0, 23, 59, 59);

      // query = query
      //   .gte('booking_time', startDate.toISOString())
      //   .lte('booking_time', endDate.toISOString());

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
