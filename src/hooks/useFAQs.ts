
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { DashboardFilters } from "@/types/dashboard";
import type { FaqQueryParams } from "@/types/faq";

interface FAQ {
  id: string;
  clinic_id: string | null;
  question: string;
  asked_count: number;
  created_at: string;
}

// Hook for dashboard FAQ section
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

// Hook for FAQ page with pagination and search
export const useFAQsPaginated = () => {
  const [queryParams, setQueryParams] = useState<FaqQueryParams>({
    page: 1,
    pageSize: 10,
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["faqs-paginated", queryParams],
    queryFn: async () => {
      let query = supabase
        .from('frequently_asked_questions')
        .select('*', { count: 'exact' });

      // Apply search filter
      if (queryParams.search) {
        query = query.ilike('question', `%${queryParams.search}%`);
      }

      // Apply sorting
      if (queryParams.sortBy) {
        query = query.order(queryParams.sortBy, { 
          ascending: queryParams.sortOrder === 'asc' 
        });
      }

      // Apply pagination
      const from = (queryParams.page - 1) * queryParams.pageSize;
      const to = from + queryParams.pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching FAQs:', error);
        throw error;
      }

      // Transform data to match FaqItem interface
      const faqs = (data || []).map(faq => ({
        id: faq.id,
        question: faq.question,
        answer: `This question has been asked ${faq.asked_count} times.`, // Placeholder answer
        category: 'General', // Placeholder category
        createdAt: faq.created_at
      }));

      return {
        faqs,
        totalCount: count || 0
      };
    },
  });

  const handlePageChange = (page: number) => {
    setQueryParams(prev => ({ ...prev, page }));
  };

  const handleSearch = (search: string) => {
    setQueryParams(prev => ({ ...prev, search, page: 1 }));
  };

  const handleSort = (sortBy: string) => {
    setQueryParams(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleChangePageSize = (pageSize: number) => {
    setQueryParams(prev => ({ ...prev, pageSize, page: 1 }));
  };

  return {
    faqs: data?.faqs || [],
    totalCount: data?.totalCount || 0,
    isLoading,
    error,
    queryParams,
    handlePageChange,
    handleSearch,
    handleSort,
    handleChangePageSize,
  };
};
