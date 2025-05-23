
import React, { useState } from 'react';
import { useFaqs } from '@/hooks/useFaqs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from '@/components/ui/accordion';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowDown, 
  ArrowUp, 
  Search, 
  Filter, 
  Loader2 
} from 'lucide-react';
import { FaqItem } from '@/types/faq';

export function FaqList() {
  const {
    faqs,
    totalCount,
    isLoading,
    error,
    queryParams,
    handlePageChange,
    handleSearch,
    handleSort,
    handleChangePageSize,
  } = useFaqs();
  
  const [searchInput, setSearchInput] = useState('');
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchInput);
  };
  
  const getSortIcon = (columnName: keyof FaqItem) => {
    if (queryParams.sortBy !== columnName) return null;
    return queryParams.sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />;
  };
  
  const totalPages = Math.ceil(totalCount / queryParams.pageSize);
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl bg-theme-dark-lighter border border-red-500/20">
        <div className="text-red-400 mb-4">Error loading FAQs</div>
        <p className="text-gray-400">There was an error loading the FAQs. Please try again later.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search FAQs..."
              className="pl-10 bg-theme-dark-lighter border-gray-800 focus:border-theme-blue"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary" className="bg-theme-blue/10 hover:bg-theme-blue/20 text-theme-blue border border-theme-blue/20">
            Search
          </Button>
        </form>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-gray-400 text-sm">Show</span>
          <Select
            value={queryParams.pageSize.toString()}
            onValueChange={(value) => handleChangePageSize(Number(value))}
          >
            <SelectTrigger className="w-16 bg-theme-dark-lighter border-gray-800">
              <SelectValue placeholder="5" />
            </SelectTrigger>
            <SelectContent className="bg-theme-dark-lighter border-gray-800">
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="15">15</SelectItem>
              <SelectItem value="20">20</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-gray-400 text-sm">items</span>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-theme-blue" />
          <span className="ml-2 text-gray-400">Loading FAQs...</span>
        </div>
      ) : faqs.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-theme-dark-lighter border border-gray-800">
          <p className="text-gray-400">No FAQs found. Try a different search.</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden bg-theme-dark-lighter border border-gray-800">
          <Table>
            <TableHeader className="bg-theme-dark">
              <TableRow className="border-gray-800 hover:bg-theme-dark-card">
                <TableHead 
                  className="cursor-pointer text-gray-400 hover:text-white"
                  onClick={() => handleSort('question')}
                >
                  <div className="flex items-center gap-2">
                    Question
                    {getSortIcon('question')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer text-gray-400 hover:text-white"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center gap-2">
                    Category
                    {getSortIcon('category')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer text-gray-400 hover:text-white w-32 text-right"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Date
                    {getSortIcon('createdAt')}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faqs.map((faq) => (
                <TableRow key={faq.id} className="border-gray-800 hover:bg-theme-blue/5">
                  <TableCell className="font-medium">
                    <Accordion type="single" collapsible>
                      <AccordionItem value={faq.id} className="border-0">
                        <AccordionTrigger className="py-2 hover:no-underline hover:text-theme-blue">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-400">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-theme-blue/20 text-theme-blue">
                      {faq.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-gray-400">
                    {new Date(faq.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => handlePageChange(Math.max(1, queryParams.page - 1))}
                className={queryParams.page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={page === queryParams.page}
                  className={page === queryParams.page ? "bg-theme-blue" : ""}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => handlePageChange(Math.min(totalPages, queryParams.page + 1))}
                className={queryParams.page >= totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
