
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchFaqs, getFaqCategories } from '@/services/faqService';
import { FaqQueryParams } from '@/types/faq';

export function useFaqs() {
  const [queryParams, setQueryParams] = useState<FaqQueryParams>({
    page: 1,
    pageSize: 5,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  
  const faqsQuery = useQuery({
    queryKey: ['faqs', queryParams],
    queryFn: () => fetchFaqs(queryParams),
  });
  
  const categoriesQuery = useQuery({
    queryKey: ['faqCategories'],
    queryFn: getFaqCategories,
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
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1,
    }));
  };
  
  const handleChangePageSize = (pageSize: number) => {
    setQueryParams(prev => ({ ...prev, pageSize, page: 1 }));
  };
  
  return {
    faqs: faqsQuery.data?.data || [],
    totalCount: faqsQuery.data?.count || 0,
    categories: categoriesQuery.data || [],
    isLoading: faqsQuery.isLoading,
    error: faqsQuery.error,
    queryParams,
    handlePageChange,
    handleSearch,
    handleSort,
    handleChangePageSize,
  };
}
