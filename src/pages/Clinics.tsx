
import React from 'react';
import { ClinicsTable } from '@/components/clinics/ClinicsTable';
import { AddClinicDialog } from '@/components/clinics/AddClinicDialog';

export default function ClinicsPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">All Clinics</h1>
          <p className="text-gray-300 mt-2">Manage all clinics in the system</p>
        </div>
        <AddClinicDialog />
      </div>
      <ClinicsTable />
    </div>
  );
}
