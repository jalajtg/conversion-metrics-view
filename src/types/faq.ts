
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  createdAt: string;
}

export interface FaqQueryParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
