
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClinic } from '@/services/clinicService';
import { createClinicProductCategory } from '@/services/clinicProductCategoryService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { ProductCategoryWithPrice } from '@/components/clinics/ProductCategorySelector';

interface ClinicFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  owner_id: string;
  productCategories: ProductCategoryWithPrice[];
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
    owner_id: '',
    productCategories: []
  });

  const createClinicMutation = useMutation({
    mutationFn: async (clinicData: ClinicFormData) => {
      const clinic = await createClinic({
        name: clinicData.name,
        email: clinicData.email,
        phone: clinicData.phone,
        address: clinicData.address,
        owner_id: clinicData.owner_id
      });
      
      if (!clinic) {
        throw new Error('Failed to create clinic');
      }

      // Create clinic product category associations
      for (const productCategory of clinicData.productCategories) {
        await createClinicProductCategory({
          clinic_id: clinic.id,
          product_category_id: productCategory.product_category_id,
          price: productCategory.price
        });
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
      queryClient.invalidateQueries({ queryKey: ["clinic-product-categories"] });
      toast({
        title: "Success",
        description: "Clinic created successfully with product categories and notification email sent!",
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

  const handleProductCategoriesChange = (categories: ProductCategoryWithPrice[]) => {
    setFormData(prev => ({
      ...prev,
      productCategories: categories
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
    handleProductCategoriesChange,
    handleSubmit,
    handleCancel,
    isSubmitting: createClinicMutation.isPending
  };
}
