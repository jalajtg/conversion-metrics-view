
import React from 'react';
import { ClinicsTable } from '@/components/clinics/ClinicsTable';

export default function ClinicsPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">My Clinics</h1>
        <p className="text-gray-300 mt-2">Manage your clinics</p>
      </div>
      <ClinicsTable />
    </div>
  );
}
