
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DashboardFilters } from "@/types/dashboard";

interface FAQ {
  id: string;
  clinic_id: string | null;
  question: string;
  asked_count: number;
  created_at: string;
}

export const useFAQs = (filters: DashboardFilters) => {
  return useQuery({
    queryKey: ["faqs", filters],
    queryFn: async (): Promise<FAQ[]> => {
      let query = supabase
        .from('frequently_asked_questions')
        .select('*')
        .order('asked_count', { ascending: false });

      // Filter by clinic IDs if specified
      if (filters.clinicIds.length > 0) {
        query = query.in('clinic_id', filters.clinicIds);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching FAQs:', error);
        throw error;
      }

      return data || [];
    },
    enabled: filters.clinicIds.length > 0,
  });
};
