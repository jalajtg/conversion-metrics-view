
import React, { useEffect } from 'react';
import { AddClinicHeader } from '@/components/clinics/AddClinicHeader';
import { ClinicForm } from '@/components/clinics/ClinicForm';
import { useCreateClinic } from '@/hooks/useCreateClinic';

export default function AddClinicPage() {
  const {
    formData,
    handleInputChange,
    handleUserSelect,
    handleProductCategoriesChange,
    handleSubmit,
    handleCancel,
    isSubmitting
  } = useCreateClinic();

  // Set page title
  useEffect(() => {
    document.title = 'Add Clinic | Dashboard Platform';
  }, []);

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <AddClinicHeader />
      <ClinicForm
        formData={formData}
        onInputChange={handleInputChange}
        onUserSelect={handleUserSelect}
        onProductCategoriesChange={handleProductCategoriesChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
