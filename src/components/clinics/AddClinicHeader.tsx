
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

export function AddClinicHeader() {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <Button
        variant="ghost"
        onClick={() => navigate('/super-admin/clinics')}
        className="mb-4 text-gray-300 hover:text-white hover:bg-gray-700"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Clinics
      </Button>
      
      <h1 className="text-3xl font-bold text-white">
        Add New Clinic
      </h1>
      <p className="text-gray-300 mt-2">
        Create a new clinic and assign an owner
      </p>
    </div>
  );
}
