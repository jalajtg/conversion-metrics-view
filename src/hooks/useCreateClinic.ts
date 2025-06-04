
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClinic } from '@/services/clinicService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface ClinicFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  owner_id: string;
}

export function useCreateClinic() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<ClinicFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    owner_id: ''
  });

  const createClinicMutation = useMutation({
    mutationFn: async (clinicData: ClinicFormData) => {
      const clinic = await createClinic(clinicData);
      if (!clinic) {
        throw new Error('Failed to create clinic');
      }
      
      // Send notification email
      const { error: emailError } = await supabase.functions.invoke('send-emails', {
        body: {
          user_id: clinicData.owner_id,
          email_type: 'clinic_added',
          clinic_name: clinicData.name
        }
      });
      
      if (emailError) {
        console.error('Error sending email notification:', emailError);
        // Don't throw error for email failure, just log it
      }
      
      return clinic;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-clinics"] });
      queryClient.invalidateQueries({ queryKey: ["user-clinics"] });
      toast({
        title: "Success",
        description: "Clinic created successfully and notification email sent!",
      });
      navigate('/super-admin/clinics');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create clinic. Please try again.",
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

    createClinicMutation.mutate(formData);
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
    isSubmitting: createClinicMutation.isPending
  };
}
