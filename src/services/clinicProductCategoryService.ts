
import { supabase } from "@/integrations/supabase/client";
import { ClinicProductCategory, ProductCategory } from "@/types/dashboard";

export const fetchClinicProductCategories = async (clinicId: string): Promise<ClinicProductCategory[]> => {
  console.log("Fetching clinic product categories for clinic:", clinicId);
  
  const { data, error } = await supabase
    .from("clinic_product_categories")
    .select(`
      *,
      product_category:product_category_id (
        id,
        name,
        description,
        created_at,
        updated_at
      )
    `)
    .eq("clinic_id", clinicId)
    .order("created_at");
  
  if (error) {
    console.error("Error fetching clinic product categories:", error);
    return [];
  }
  
  console.log("Clinic product categories data:", data);
  return data || [];
};

export const fetchAllProductCategories = async (): Promise<ProductCategory[]> => {
  console.log("Fetching all product categories...");
  
  const { data, error } = await supabase
    .from("product_category")
    .select("*")
    .order("name");
  
  if (error) {
    console.error("Error fetching product categories:", error);
    return [];
  }
  
  console.log("Product categories data:", data);
  return data || [];
};

export const createClinicProductCategory = async (
  clinicProductCategory: Omit<ClinicProductCategory, 'id' | 'created_at' | 'updated_at'>
): Promise<ClinicProductCategory | null> => {
  const { data, error } = await supabase
    .from("clinic_product_categories")
    .insert({
      clinic_id: clinicProductCategory.clinic_id,
      product_category_id: clinicProductCategory.product_category_id,
      price: clinicProductCategory.price,
      month: clinicProductCategory.month
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating clinic product category:", error);
    return null;
  }
  
  return data;
};

export const updateClinicProductCategory = async (
  id: string, 
  updates: Partial<Pick<ClinicProductCategory, 'price' | 'month'>>
): Promise<ClinicProductCategory | null> => {
  const { data, error } = await supabase
    .from("clinic_product_categories")
    .update({
      price: updates.price,
      month: updates.month,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating clinic product category:", error);
    return null;
  }
  
  return data;
};

export const deleteClinicProductCategory = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from("clinic_product_categories")
    .delete()
    .eq("id", id);
  
  if (error) {
    console.error("Error deleting clinic product category:", error);
    return false;
  }
  
  return true;
};
