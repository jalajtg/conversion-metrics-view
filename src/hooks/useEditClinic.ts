
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateClinic } from '@/services/clinicService';
import { useToast } from "@/hooks/use-toast";

interface ClinicFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  owner_id: string;
}

export function useEditClinic(clinic: any) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<ClinicFormData>({
    name: clinic.name || '',
    email: clinic.email || '',
    phone: clinic.phone || '',
    address: clinic.address || '',
    owner_id: clinic.owner_id || ''
  });

  const updateClinicMutation = useMutation({
    mutationFn: async (clinicData: ClinicFormData) => {
      const updatedClinic = await updateClinic(clinic.id, clinicData);
      if (!updatedClinic) {
        throw new Error('Failed to update clinic');
      }
      return updatedClinic;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-clinics"] });
      queryClient.invalidateQueries({ queryKey: ["user-clinics"] });
      toast({
        title: "Success",
        description: "Clinic updated successfully!",
      });
      navigate('/super-admin/clinics');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update clinic. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserSelect = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      owner_id: userId
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.owner_id) {
      toast({
        title: "Error",
        description: "Please fill in the clinic name and select an owner.",
        variant: "destructive",
      });
      return;
    }

    updateClinicMutation.mutate(formData);
  };

  const handleCancel = () => {
    navigate('/super-admin/clinics');
  };

  return {
    formData,
    handleInputChange,
    handleUserSelect,
    handleSubmit,
    handleCancel,
    isSubmitting: updateClinicMutation.isPending
  };
}
