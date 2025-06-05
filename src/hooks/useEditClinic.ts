
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateClinic } from '@/services/clinicService';
import { createClinicProductCategory, deleteClinicProductCategory, fetchClinicProductCategories } from '@/services/clinicProductCategoryService';
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

export function useEditClinic(clinic: any) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<ClinicFormData>({
    name: clinic.name || '',
    email: clinic.email || '',
    phone: clinic.phone || '',
    address: clinic.address || '',
    owner_id: clinic.owner_id || '',
    productCategories: []
  });

  // Load existing product categories for the clinic
  React.useEffect(() => {
    const loadExistingCategories = async () => {
      try {
        const existingCategories = await fetchClinicProductCategories(clinic.id);
        const productCategories = existingCategories.map(cat => ({
          product_category_id: cat.product_category_id,
          price: cat.price
        }));
        setFormData(prev => ({
          ...prev,
          productCategories
        }));
      } catch (error) {
        console.error('Error loading existing product categories:', error);
      }
    };

    if (clinic.id) {
      loadExistingCategories();
    }
  }, [clinic.id]);

  const updateClinicMutation = useMutation({
    mutationFn: async (clinicData: ClinicFormData) => {
      const updatedClinic = await updateClinic(clinic.id, {
        name: clinicData.name,
        email: clinicData.email,
        phone: clinicData.phone,
        address: clinicData.address
      });
      
      if (!updatedClinic) {
        throw new Error('Failed to update clinic');
      }

      // Get existing product categories to compare
      const existingCategories = await fetchClinicProductCategories(clinic.id);
      const existingCategoryIds = existingCategories.map(cat => cat.product_category_id);
      const newCategoryIds = clinicData.productCategories.map(cat => cat.product_category_id);

      // Delete removed categories
      for (const existingCategory of existingCategories) {
        if (!newCategoryIds.includes(existingCategory.product_category_id)) {
          await deleteClinicProductCategory(existingCategory.id);
        }
      }

      // Create or update categories
      for (const productCategory of clinicData.productCategories) {
        const existingCategory = existingCategories.find(
          cat => cat.product_category_id === productCategory.product_category_id
        );

        if (existingCategory) {
          // Update existing if price changed
          if (existingCategory.price !== productCategory.price) {
            await updateClinicProductCategory(existingCategory.id, { price: productCategory.price });
          }
        } else {
          // Create new association
          await createClinicProductCategory({
            clinic_id: clinic.id,
            product_category_id: productCategory.product_category_id,
            price: productCategory.price
          });
        }
      }
      
      return updatedClinic;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-clinics"] });
      queryClient.invalidateQueries({ queryKey: ["user-clinics"] });
      queryClient.invalidateQueries({ queryKey: ["clinic-product-categories"] });
      toast({
        title: "Success",
        description: "Clinic updated successfully with product categories!",
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

    updateClinicMutation.mutate(formData);
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
    isSubmitting: updateClinicMutation.isPending
  };
}
