
import React, { useState } from 'react';
import { useAllClinics } from '@/hooks/useAllClinics';
import { useClinics } from '@/hooks/useClinics';
import { useUserRole } from '@/hooks/useUserRole';
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
import { Loader2, Trash2, Edit } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { EditClinicDialog } from './EditClinicDialog';

export function ClinicsTable() {
  const { isSuperAdmin, isLoading: roleLoading } = useUserRole();
  const { data: allClinics, isLoading: allClinicsLoading, error: allClinicsError } = useAllClinics();
  const { data: userClinics, isLoading: userClinicsLoading, error: userClinicsError } = useClinics();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingClinic, setEditingClinic] = useState<any>(null);

  const clinics = isSuperAdmin ? allClinics : userClinics;
  const isLoading = roleLoading || (isSuperAdmin ? allClinicsLoading : userClinicsLoading);
  const error = isSuperAdmin ? allClinicsError : userClinicsError;

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
          <CardTitle className="text-white">
            {isSuperAdmin ? 'All Clinics' : 'My Clinics'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {clinics && clinics.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-theme-dark-lighter">
                  <TableHead className="text-gray-300 font-semibold">Name</TableHead>
                  {isSuperAdmin && (
                    <TableHead className="text-gray-300 font-semibold">Owner</TableHead>
                  )}
                  <TableHead className="text-gray-300 font-semibold">Email</TableHead>
                  <TableHead className="text-gray-300 font-semibold">Phone</TableHead>
                  <TableHead className="text-gray-300 font-semibold">Address</TableHead>
                  <TableHead className="text-gray-300 font-semibold">Created At</TableHead>
                  <TableHead className="text-gray-300 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clinics.map((clinic: any) => (
                  <TableRow key={clinic.id} className="border-gray-700 hover:bg-theme-dark-lighter transition-colors">
                    <TableCell className="font-medium text-white">{clinic.name}</TableCell>
                    {isSuperAdmin && (
                      <TableCell className="text-gray-300">{clinic.profiles?.name || 'Unknown Owner'}</TableCell>
                    )}
                    <TableCell className="text-gray-300">{clinic.email || 'N/A'}</TableCell>
                    <TableCell className="text-gray-300">{clinic.phone || 'N/A'}</TableCell>
                    <TableCell className="text-gray-300">{clinic.address || 'N/A'}</TableCell>
                    <TableCell className="text-gray-300">
                      {new Date(clinic.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingClinic(clinic)}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {isSuperAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(clinic.id)}
                            disabled={deleteClinicMutation.isPending}
                            className="border-red-600 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-gray-400 p-8 bg-theme-dark-lighter/50">
              <p className="text-lg">No clinics found.</p>
              <p className="text-sm text-gray-500 mt-2">
                {isSuperAdmin 
                  ? 'Create the first clinic to get started.' 
                  : 'You have no clinics assigned to you.'
                }
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
