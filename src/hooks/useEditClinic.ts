
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateClinic } from '@/services/clinicService';
import { createClinicProductCategory, deleteClinicProductCategory, fetchClinicProductCategories, updateClinicProductCategory } from '@/services/clinicProductCategoryService';
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

  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Load existing product categories for the clinic
  React.useEffect(() => {
    const loadExistingCategories = async () => {
      try {
        console.log('Loading existing categories for clinic:', clinic.id);
        setIsLoadingCategories(true);
        const existingCategories = await fetchClinicProductCategories(clinic.id);
        console.log('Existing categories loaded:', existingCategories);
        
        // Convert database format to new UI format
        const categoryMap = new Map<string, ProductCategoryWithPrice>();
        
        existingCategories.forEach(cat => {
          const categoryId = cat.product_category_id;
          
          if (!categoryMap.has(categoryId)) {
            categoryMap.set(categoryId, {
              product_category_id: categoryId,
              prices: []
            });
          }
          
          const category = categoryMap.get(categoryId)!;
          category.prices.push({
            month: cat.month,
            price: cat.price
          });
        });
        
        const productCategories = Array.from(categoryMap.values());
        console.log('Mapped product categories:', productCategories);
        
        setFormData(prev => {
          const updated = {
            ...prev,
            productCategories
          };
          console.log('Updated form data with categories:', updated);
          return updated;
        });
      } catch (error) {
        console.error('Error loading existing product categories:', error);
        toast({
          title: "Error",
          description: "Failed to load existing product categories",
          variant: "destructive",
        });
      } finally {
        setIsLoadingCategories(false);
      }
    };

    if (clinic.id) {
      loadExistingCategories();
    }
  }, [clinic.id, toast]);

  const updateClinicMutation = useMutation({
    mutationFn: async (clinicData: ClinicFormData) => {
      console.log('Starting clinic update with data:', clinicData);
      
      // Validate required fields
      if (!clinicData.name || !clinicData.owner_id) {
        throw new Error('Clinic name and owner are required');
      }

      try {
        // Update clinic basic info
        console.log('Updating clinic basic info...');
        const updatedClinic = await updateClinic(clinic.id, {
          name: clinicData.name,
          email: clinicData.email,
          phone: clinicData.phone,
          address: clinicData.address
        });
        
        if (!updatedClinic) {
          throw new Error('Failed to update clinic basic information');
        }
        console.log('Clinic basic info updated successfully:', updatedClinic);

        // Handle product categories with monthly pricing
        console.log('Processing product categories...');
        const existingCategories = await fetchClinicProductCategories(clinic.id);
        console.log('Current existing categories:', existingCategories);
        console.log('New categories to save:', clinicData.productCategories);
        
        // Create a key for comparison (category_id + month)
        const existingKeys = existingCategories.map(cat => `${cat.product_category_id}-${cat.month}`);
        
        // Convert new format to individual entries for comparison
        const newEntries: Array<{product_category_id: string, month: number, price: number}> = [];
        clinicData.productCategories.forEach(cat => {
          cat.prices.forEach(price => {
            newEntries.push({
              product_category_id: cat.product_category_id,
              month: price.month,
              price: price.price
            });
          });
        });
        
        const newKeys = newEntries.map(entry => `${entry.product_category_id}-${entry.month}`);

        console.log('Existing keys:', existingKeys);
        console.log('New keys:', newKeys);

        // Delete removed categories
        const categoriesToDelete = existingCategories.filter(
          cat => !newKeys.includes(`${cat.product_category_id}-${cat.month}`)
        );
        console.log('Categories to delete:', categoriesToDelete);

        for (const categoryToDelete of categoriesToDelete) {
          console.log('Deleting category:', categoryToDelete.id);
          const deleteResult = await deleteClinicProductCategory(categoryToDelete.id);
          if (!deleteResult) {
            console.error('Failed to delete category:', categoryToDelete.id);
          }
        }

        // Create or update categories
        for (const newEntry of newEntries) {
          console.log('Processing entry:', newEntry);
          
          const existingCategory = existingCategories.find(
            cat => cat.product_category_id === newEntry.product_category_id && 
                   cat.month === newEntry.month
          );

          if (existingCategory) {
            // Update existing if price changed
            if (existingCategory.price !== newEntry.price) {
              console.log('Updating category price:', existingCategory.id, 'from', existingCategory.price, 'to', newEntry.price);
              const updateResult = await updateClinicProductCategory(existingCategory.id, { 
                price: newEntry.price 
              });
              if (!updateResult) {
                console.error('Failed to update category price:', existingCategory.id);
              }
            } else {
              console.log('Category price unchanged, skipping update:', existingCategory.id);
            }
          } else {
            // Create new association
            console.log('Creating new category association:', newEntry);
            const createResult = await createClinicProductCategory({
              clinic_id: clinic.id,
              product_category_id: newEntry.product_category_id,
              price: newEntry.price,
              month: newEntry.month
            });
            if (!createResult) {
              console.error('Failed to create category association:', newEntry);
            }
          }
        }
        
        console.log('Product categories processed successfully');
        return updatedClinic;
      } catch (error) {
        console.error('Error in clinic update process:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('Clinic update completed successfully');
      queryClient.invalidateQueries({ queryKey: ["all-clinics"] });
      queryClient.invalidateQueries({ queryKey: ["user-clinics"] });
      queryClient.invalidateQueries({ queryKey: ["clinic-product-categories"] });
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
      toast({
        title: "Success",
        description: "Clinic updated successfully with monthly product category pricing!",
      });
      navigate('/super-admin/clinics');
    },
    onError: (error: any) => {
      console.error('Clinic update failed:', error);
      const errorMessage = error.message || "Failed to update clinic. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
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
    console.log('Product categories changed in useEditClinic:', categories);
    setFormData(prev => {
      const updated = {
        ...prev,
        productCategories: categories
      };
      console.log('Updated form data after category change:', updated);
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    // Validation
    const errors = [];
    if (!formData.name.trim()) {
      errors.push('Clinic name is required');
    }
    if (!formData.owner_id) {
      errors.push('Clinic owner must be selected');
    }
    
    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      toast({
        title: "Validation Error",
        description: errors.join('. '),
        variant: "destructive",
      });
      return;
    }

    console.log('Validation passed, submitting clinic update...');
    updateClinicMutation.mutate(formData);
  };

  const handleCancel = () => {
    console.log('Edit cancelled, navigating back');
    navigate('/super-admin/clinics');
  };

  return {
    formData,
    handleInputChange,
    handleUserSelect,
    handleProductCategoriesChange,
    handleSubmit,
    handleCancel,
    isSubmitting: updateClinicMutation.isPending,
    isLoadingCategories
  };
}
