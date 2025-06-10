
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClinic } from '@/services/clinicService';
import { createClinicProductCategory } from '@/services/clinicProductCategoryService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { ProductCategoryWithPrice } from '@/components/clinics/ProductCategoryManager';

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
      console.log('Creating clinic with data:', clinicData);
      
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

      console.log('Clinic created successfully:', clinic);

      // Create clinic product category associations
      for (const productCategory of clinicData.productCategories) {
        console.log('Creating product category association:', productCategory);
        const result = await createClinicProductCategory({
          clinic_id: clinic.id,
          product_category_id: productCategory.product_category_id,
          price: productCategory.price
        });
        if (!result) {
          console.error('Failed to create product category association:', productCategory);
        }
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
      console.log('Clinic creation completed successfully');
      queryClient.invalidateQueries({ queryKey: ["all-clinics"] });
      queryClient.invalidateQueries({ queryKey: ["user-clinics"] });
      queryClient.invalidateQueries({ queryKey: ["clinic-product-categories"] });
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
      toast({
        title: "Success",
        description: "Clinic created successfully with product categories and notification email sent!",
      });
      navigate('/super-admin/clinics');
    },
    onError: (error: any) => {
      console.error('Clinic creation failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create clinic. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log('Input changed:', name, '=', value);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserSelect = (userId: string) => {
    console.log('User selected:', userId);
    setFormData(prev => ({
      ...prev,
      owner_id: userId
    }));
  };

  const handleProductCategoriesChange = (categories: ProductCategoryWithPrice[]) => {
    console.log('Product categories changed in useCreateClinic:', categories);
    setFormData(prev => ({
      ...prev,
      productCategories: categories
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
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
