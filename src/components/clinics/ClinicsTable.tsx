
import React, { useState } from 'react';
import { useAllClinics } from '@/hooks/useAllClinics';
import { useUserRole } from '@/hooks/useUserRole';
import { useTableState, usePaginatedAndSortedData } from '@/hooks/useTableState';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteClinic } from '@/services/clinicService';
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Loader2, 
  Trash2, 
  Edit, 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  MoreHorizontal
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { EditClinicDialog } from './EditClinicDialog';

export function ClinicsTable() {
  const { isSuperAdmin, isLoading: roleLoading } = useUserRole();
  const { data: clinics, isLoading: clinicsLoading, error: clinicsError } = useAllClinics();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingClinic, setEditingClinic] = useState<any>(null);

  const { state, updateState, resetToFirstPage } = useTableState(10);
  const { paginatedData, totalPages, totalItems } = usePaginatedAndSortedData(
    clinics,
    state,
    ['name', 'email', 'phone', 'address', 'profiles.name']
  );

  const isLoading = roleLoading || clinicsLoading;
  const error = clinicsError;

  const deleteClinicMutation = useMutation({
    mutationFn: deleteClinic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-clinics"] });
      queryClient.invalidateQueries({ queryKey: ["user-clinics"] });
      toast({
        title: "Success",
        description: "Clinic deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete clinic. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this clinic?')) {
      deleteClinicMutation.mutate(id);
    }
  };

  const handleSort = (field: string) => {
    if (state.sortBy === field) {
      updateState({
        sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc'
      });
    } else {
      updateState({
        sortBy: field,
        sortOrder: 'asc'
      });
    }
    resetToFirstPage();
  };

  const handleSearch = (searchTerm: string) => {
    updateState({ searchTerm });
    resetToFirstPage();
  };

  const getSortIcon = (field: string) => {
    if (state.sortBy !== field) return <ArrowUpDown className="h-4 w-4" />;
    return state.sortOrder === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />;
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (let i = Math.max(2, state.page - delta); 
           i <= Math.min(totalPages - 1, state.page + delta); 
           i++) {
        range.push(i);
      }

      if (state.page - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (state.page + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    return (
      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => state.page > 1 && updateState({ page: state.page - 1 })}
              className={state.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {getVisiblePages().map((page, index) => (
            <PaginationItem key={index}>
              {page === '...' ? (
                <span className="px-4 py-2">...</span>
              ) : (
                <PaginationLink
                  onClick={() => updateState({ page: page as number })}
                  isActive={state.page === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => state.page < totalPages && updateState({ page: state.page + 1 })}
              className={state.page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
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
        Error loading clinics. Please try again.
      </div>
    );
  }

  return (
    <>
      <Card className="w-full bg-theme-dark-card border-gray-700">
        <CardHeader className="border-b border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-white">
              All Clinics ({totalItems})
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search clinics..."
                  value={state.searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 w-64 bg-theme-dark-lighter border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Show:</span>
                <select
                  value={state.pageSize}
                  onChange={(e) => {
                    updateState({ pageSize: Number(e.target.value) });
                    resetToFirstPage();
                  }}
                  className="bg-theme-dark-lighter border border-gray-600 rounded px-2 py-1 text-white"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {paginatedData && paginatedData.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700 hover:bg-theme-dark-lighter">
                    <TableHead className="text-gray-300 font-semibold">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('name')}
                        className="h-auto p-0 text-gray-300 hover:text-white hover:bg-transparent"
                      >
                        Name {getSortIcon('name')}
                      </Button>
                    </TableHead>
                    <TableHead className="text-gray-300 font-semibold">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('profiles.name')}
                        className="h-auto p-0 text-gray-300 hover:text-white hover:bg-transparent"
                      >
                        Owner {getSortIcon('profiles.name')}
                      </Button>
                    </TableHead>
                    <TableHead className="text-gray-300 font-semibold">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('email')}
                        className="h-auto p-0 text-gray-300 hover:text-white hover:bg-transparent"
                      >
                        Email {getSortIcon('email')}
                      </Button>
                    </TableHead>
                    <TableHead className="text-gray-300 font-semibold">Phone</TableHead>
                    <TableHead className="text-gray-300 font-semibold">Address</TableHead>
                    <TableHead className="text-gray-300 font-semibold">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('created_at')}
                        className="h-auto p-0 text-gray-300 hover:text-white hover:bg-transparent"
                      >
                        Created {getSortIcon('created_at')}
                      </Button>
                    </TableHead>
                    <TableHead className="text-gray-300 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((clinic: any) => (
                    <TableRow key={clinic.id} className="border-gray-700 hover:bg-theme-dark-lighter transition-colors">
                      <TableCell className="font-medium text-white">{clinic.name}</TableCell>
                      <TableCell className="text-gray-300">{clinic.profiles?.name || 'Unknown Owner'}</TableCell>
                      <TableCell className="text-gray-300">{clinic.email || 'N/A'}</TableCell>
                      <TableCell className="text-gray-300">{clinic.phone || 'N/A'}</TableCell>
                      <TableCell className="text-gray-300">{clinic.address || 'N/A'}</TableCell>
                      <TableCell className="text-gray-300">
                        {new Date(clinic.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-theme-dark-card border-gray-600">
                            <DropdownMenuItem
                              onClick={() => setEditingClinic(clinic)}
                              className="text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {isSuperAdmin && (
                              <DropdownMenuItem
                                onClick={() => handleDelete(clinic.id)}
                                disabled={deleteClinicMutation.isPending}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {renderPagination()}
            </>
          ) : (
            <div className="text-center text-gray-400 p-8 bg-theme-dark-lighter/50">
              <p className="text-lg">
                {state.searchTerm ? 'No clinics found matching your search.' : 'No clinics found.'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {state.searchTerm ? 'Try adjusting your search terms.' : 'Create the first clinic to get started.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {editingClinic && (
        <EditClinicDialog
          clinic={editingClinic}
          open={!!editingClinic}
          onOpenChange={(open) => !open && setEditingClinic(null)}
        />
      )}
    </>
  );
}
