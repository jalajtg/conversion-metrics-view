
import React from 'react';
import { ClinicsTable } from '@/components/clinics/ClinicsTable';
import { AddClinicDialog } from '@/components/clinics/AddClinicDialog';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2 } from 'lucide-react';

export default function ClinicsPage() {
  const { isSuperAdmin, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-theme-blue" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {isSuperAdmin ? 'All Clinics' : 'My Clinics'}
          </h1>
          <p className="text-gray-300 mt-2">
            {isSuperAdmin 
              ? 'Manage all clinics in the system' 
              : 'Manage your clinics'
            }
          </p>
        </div>
        {isSuperAdmin && <AddClinicDialog />}
      </div>
      <ClinicsTable />
    </div>
  );
}
