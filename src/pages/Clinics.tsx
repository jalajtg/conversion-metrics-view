
import React from 'react';
import { ClinicsTable } from '@/components/clinics/ClinicsTable';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2 } from 'lucide-react';

export default function ClinicsPage() {
  const { isLoading } = useUserRole();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-theme-blue" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">
          All Clinics
        </h1>
        <p className="text-gray-300 mt-2">
          View all clinics in the system
        </p>
      </div>
      <ClinicsTable />
    </div>
  );
}
