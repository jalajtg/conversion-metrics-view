
import React, { useState } from 'react';
import { useAllProducts } from '@/hooks/useAllProducts';
import { useClinics } from '@/hooks/useClinics';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProduct } from '@/services/productService';
import { useTableState, usePaginatedAndSortedData } from '@/hooks/useTableState';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2, Search, Filter, ChevronUp, ChevronDown } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { AddProductDialog } from './AddProductDialog';

export function ProductsTable() {
  // All hooks must be called at the top level
  const { data: products, isLoading, error } = useAllProducts();
  const { data: clinics } = useClinics();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { state, updateState, resetToFirstPage } = useTableState();
  
  // State hooks
  const [selectedClinic, setSelectedClinic] = useState<string>('all');

  // Mutation hook
  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-products"] });
      toast({
        title: "Success",
        description: "Product deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter products based on search term and selected clinic
  const filteredProducts = React.useMemo(() => {
    if (!products) return [];
    
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(state.searchTerm.toLowerCase());
      const matchesClinic = selectedClinic === 'all' || product.clinic_id === selectedClinic;
      return matchesSearch && matchesClinic;
    });
  }, [products, state.searchTerm, selectedClinic]);

  // Use the filtered products for pagination
  const { paginatedData, totalPages } = usePaginatedAndSortedData(
    filteredProducts,
    state,
    ['name']
  );

  const handleDelete = (id: string) => {
    deleteProductMutation.mutate(id);
  };

  const handleSearch = (value: string) => {
    updateState({ searchTerm: value });
    resetToFirstPage();
  };

  const handleClinicFilter = (value: string) => {
    setSelectedClinic(value);
    resetToFirstPage();
  };

  const handleSort = (column: string) => {
    if (state.sortBy === column) {
      updateState({ sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      updateState({ sortBy: column, sortOrder: 'asc' });
    }
    resetToFirstPage();
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (state.sortBy !== column) return null;
    return state.sortOrder === 'asc' ? 
      <ChevronUp className="h-4 w-4 ml-1" /> : 
      <ChevronDown className="h-4 w-4 ml-1" />;
  };

  // Generate page numbers for pagination (show 4 pages at a time)
  const getVisiblePages = () => {
    const currentPage = state.page;
    const maxVisiblePages = 4;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-theme-blue" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 p-4 bg-theme-dark-card rounded-lg border border-red-500/20">
        Error loading products. Please try again.
      </div>
    );
  }

  return (
    <>
      <Card className="w-full bg-theme-dark-card border-gray-700">
        <CardHeader className="border-b border-gray-700 pb-4">
          <CardTitle className="text-white flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <span>All Products</span>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={state.searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 w-full sm:w-64 bg-theme-dark-lighter border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>
              <Select value={selectedClinic} onValueChange={handleClinicFilter}>
                <SelectTrigger className="w-full sm:w-48 bg-theme-dark-lighter border-gray-600 text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by clinic" />
                </SelectTrigger>
                <SelectContent className="bg-theme-dark-card border-gray-600">
                  <SelectItem value="all" className="text-white hover:bg-theme-dark-lighter">All Clinics</SelectItem>
                  {clinics?.map((clinic) => (
                    <SelectItem key={clinic.id} value={clinic.id} className="text-white hover:bg-theme-dark-lighter">
                      {clinic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <AddProductDialog />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {paginatedData && paginatedData.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-theme-dark-lighter">
                      <TableHead 
                        className="text-gray-300 font-semibold cursor-pointer select-none text-left py-3"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          Name
                          <SortIcon column="name" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-gray-300 font-semibold cursor-pointer select-none text-left py-3"
                        onClick={() => handleSort('price')}
                      >
                        <div className="flex items-center">
                          Price
                          <SortIcon column="price" />
                        </div>
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-left py-3">Clinic</TableHead>
                      <TableHead 
                        className="text-gray-300 font-semibold cursor-pointer select-none text-left py-3"
                        onClick={() => handleSort('created_at')}
                      >
                        <div className="flex items-center">
                          Created At
                          <SortIcon column="created_at" />
                        </div>
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-left py-3 w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((product) => (
                      <TableRow key={product.id} className="border-gray-700 hover:bg-theme-dark-lighter transition-colors">
                        <TableCell className="font-medium text-white text-left py-3">{product.name}</TableCell>
                        <TableCell className="text-gray-300 text-left py-3">${Number(product.price).toFixed(2)}</TableCell>
                        <TableCell className="text-gray-300 text-left py-3">
                          {clinics?.find(c => c.id === product.clinic_id)?.name || 'Unknown Clinic'}
                        </TableCell>
                        <TableCell className="text-gray-300 text-left py-3">
                          {new Date(product.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="py-3">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-600 text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-theme-dark-card border-gray-700">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">Delete Product</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-300">
                                  Are you sure you want to delete "{product.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-theme-dark-lighter text-white hover:bg-gray-700">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(product.id)}
                                  className="bg-red-600 text-white hover:bg-red-700"
                                  disabled={deleteProductMutation.isPending}
                                >
                                  {deleteProductMutation.isPending ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="border-t border-gray-700 p-4">
                  <Pagination className="flex justify-center">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          className={`text-white hover:bg-theme-dark-lighter ${
                            state.page === 1 ? 'opacity-50 pointer-events-none' : 'cursor-pointer'
                          }`}
                          onClick={() => state.page > 1 && updateState({ page: state.page - 1 })}
                        />
                      </PaginationItem>
                      
                      {getVisiblePages().map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            className={`text-white hover:bg-theme-dark-lighter cursor-pointer ${
                              state.page === page ? 'bg-theme-blue' : ''
                            }`}
                            onClick={() => updateState({ page })}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          className={`text-white hover:bg-theme-dark-lighter ${
                            state.page === totalPages ? 'opacity-50 pointer-events-none' : 'cursor-pointer'
                          }`}
                          onClick={() => state.page < totalPages && updateState({ page: state.page + 1 })}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-400 p-8 bg-theme-dark-lighter/50">
              <p className="text-lg">No products found.</p>
              <p className="text-sm text-gray-500 mt-2">
                {state.searchTerm || selectedClinic !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Create your first product to get started.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
