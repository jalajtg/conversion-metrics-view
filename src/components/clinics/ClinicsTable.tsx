
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
  Loader2, 
  Trash2, 
  Edit, 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  ChevronLeft,
  ChevronRight
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

    const startIndex = (state.page - 1) * state.pageSize + 1;
    const endIndex = Math.min(state.page * state.pageSize, totalItems);

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-4 py-3 bg-theme-dark-card border border-gray-700 rounded-lg">
        <div className="text-sm text-gray-400">
          Showing {startIndex} to {endIndex} of {totalItems} entries
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateState({ page: state.page - 1 })}
            disabled={state.page <= 1}
            className="bg-theme-dark-lighter border-gray-600 text-white hover:bg-gray-700 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (state.page <= 3) {
                pageNum = i + 1;
              } else if (state.page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = state.page - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={state.page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateState({ page: pageNum })}
                  className={state.page === pageNum 
                    ? "bg-theme-blue text-white hover:bg-theme-blue/90" 
                    : "bg-theme-dark-lighter border-gray-600 text-white hover:bg-gray-700"
                  }
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateState({ page: state.page + 1 })}
            disabled={state.page >= totalPages}
            className="bg-theme-dark-lighter border-gray-600 text-white hover:bg-gray-700 disabled:opacity-50"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
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
        <CardHeader className="border-b border-gray-700 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle className="text-white text-xl">
              All Clinics ({totalItems})
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search clinics..."
                  value={state.searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 w-full sm:w-64 bg-theme-dark-lighter border-gray-600 text-white placeholder-gray-400 focus:border-theme-blue focus:ring-theme-blue"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 whitespace-nowrap">Show:</span>
                <select
                  value={state.pageSize}
                  onChange={(e) => {
                    updateState({ pageSize: Number(e.target.value) });
                    resetToFirstPage();
                  }}
                  className="bg-theme-dark-lighter border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:border-theme-blue focus:ring-theme-blue"
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
              <div className="overflow-x-auto">
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
                      <TableHead className="text-gray-300 font-semibold hidden md:table-cell">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('profiles.name')}
                          className="h-auto p-0 text-gray-300 hover:text-white hover:bg-transparent"
                        >
                          Owner {getSortIcon('profiles.name')}
                        </Button>
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold hidden lg:table-cell">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('email')}
                          className="h-auto p-0 text-gray-300 hover:text-white hover:bg-transparent"
                        >
                          Email {getSortIcon('email')}
                        </Button>
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold hidden xl:table-cell">Phone</TableHead>
                      <TableHead className="text-gray-300 font-semibold hidden xl:table-cell">Address</TableHead>
                      <TableHead className="text-gray-300 font-semibold hidden lg:table-cell">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('created_at')}
                          className="h-auto p-0 text-gray-300 hover:text-white hover:bg-transparent"
                        >
                          Created {getSortIcon('created_at')}
                        </Button>
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((clinic: any) => (
                      <TableRow key={clinic.id} className="border-gray-700 hover:bg-theme-dark-lighter transition-colors">
                        <TableCell className="font-medium text-white">
                          <div>
                            <div className="font-medium">{clinic.name}</div>
                            <div className="md:hidden text-sm text-gray-400 mt-1">
                              {clinic.profiles?.name || 'Unknown Owner'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300 hidden md:table-cell">
                          {clinic.profiles?.name || 'Unknown Owner'}
                        </TableCell>
                        <TableCell className="text-gray-300 hidden lg:table-cell">
                          {clinic.email || 'N/A'}
                        </TableCell>
                        <TableCell className="text-gray-300 hidden xl:table-cell">
                          {clinic.phone || 'N/A'}
                        </TableCell>
                        <TableCell className="text-gray-300 hidden xl:table-cell">
                          <div className="max-w-xs truncate" title={clinic.address}>
                            {clinic.address || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300 hidden lg:table-cell">
                          {new Date(clinic.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingClinic(clinic)}
                              className="bg-theme-dark-lighter border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="hidden sm:inline ml-1">Edit</span>
                            </Button>
                            {isSuperAdmin && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(clinic.id)}
                                disabled={deleteClinicMutation.isPending}
                                className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="hidden sm:inline ml-1">Delete</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
