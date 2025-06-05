
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface AddClinicHeaderProps {
  isEdit?: boolean;
}

export function AddClinicHeader({ isEdit = false }: AddClinicHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/super-admin/clinics')}
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Clinics
        </Button>
      </div>
      
      <div>
        <h1 className="text-3xl font-bold text-white">
          {isEdit ? 'Edit Clinic' : 'Add New Clinic'}
        </h1>
        <p className="text-gray-300 mt-2">
          {isEdit 
            ? 'Update clinic information and settings'
            : 'Create a new clinic and assign an owner'
          }
        </p>
      </div>
    </div>
  );
}
