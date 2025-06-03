
import { useState, useMemo } from 'react';

export interface TableState {
  page: number;
  pageSize: number;
  sortBy: string | null;
  sortOrder: 'asc' | 'desc';
  searchTerm: string;
}

export function useTableState(initialPageSize = 10) {
  const [state, setState] = useState<TableState>({
    page: 1,
    pageSize: initialPageSize,
    sortBy: null,
    sortOrder: 'asc',
    searchTerm: '',
  });

  const updateState = (updates: Partial<TableState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const resetToFirstPage = () => {
    setState(prev => ({ ...prev, page: 1 }));
  };

  return {
    state,
    updateState,
    resetToFirstPage,
  };
}

export function usePaginatedAndSortedData<T extends Record<string, any>>(
  data: T[] | undefined,
  state: TableState,
  searchFields: (keyof T)[] = []
) {
  return useMemo(() => {
    if (!data) return { paginatedData: [], totalPages: 0, totalItems: 0 };

    let filteredData = [...data];

    // Apply search filter
    if (state.searchTerm && searchFields.length > 0) {
      filteredData = filteredData.filter(item =>
        searchFields.some(field =>
          String(item[field] || '').toLowerCase().includes(state.searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (state.sortBy) {
      filteredData.sort((a, b) => {
        const aValue = a[state.sortBy!];
        const bValue = b[state.sortBy!];
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        const comparison = String(aValue).localeCompare(String(bValue), undefined, { numeric: true });
        return state.sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / state.pageSize);
    const startIndex = (state.page - 1) * state.pageSize;
    const paginatedData = filteredData.slice(startIndex, startIndex + state.pageSize);

    return {
      paginatedData,
      totalPages,
      totalItems,
      filteredData,
    };
  }, [data, state, searchFields]);
}
