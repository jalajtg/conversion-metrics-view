
import React, { useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { AddClinicHeader } from '@/components/clinics/AddClinicHeader';
import { ClinicForm } from '@/components/clinics/ClinicForm';
import { useEditClinic } from '@/hooks/useEditClinic';

export default function EditClinicPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const clinic = location.state?.clinic;

  // Set page title
  useEffect(() => {
    document.title = 'Edit Clinic | Dashboard Platform';
  }, []);
  
  // If no clinic data in state, redirect back
  if (!clinic || !id) {
    navigate('/super-admin/clinics');
    return null;
  }

  const {
    formData,
    handleInputChange,
    handleUserSelect,
    handleProductCategoriesChange,
    handleSubmit,
    handleCancel,
    isSubmitting
  } = useEditClinic(clinic);

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <AddClinicHeader isEdit />
      <ClinicForm
        formData={formData}
        onInputChange={handleInputChange}
        onUserSelect={handleUserSelect}
        onProductCategoriesChange={handleProductCategoriesChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        isEdit
      />
    </div>
  );
}
