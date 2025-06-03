
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClinicsTable } from '@/components/clinics/ClinicsTable';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';

export default function ClinicsPage() {
  const navigate = useNavigate();
  const { isLoading, isSuperAdmin } = useUserRole();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-theme-blue" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            All Clinics
          </h1>
          <p className="text-gray-300 mt-2">
            View all clinics in the system
          </p>
        </div>
        
        {isSuperAdmin && (
          <Button
            onClick={() => navigate('/super-admin/add-clinic')}
            className="bg-theme-blue hover:bg-theme-blue/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Clinic
          </Button>
        )}
      </div>
      <ClinicsTable />
    </div>
  );
}
