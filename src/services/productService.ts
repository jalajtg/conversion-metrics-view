
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/dashboard";

export const fetchAllProducts = async (): Promise<Product[]> => {
  console.log("Fetching all products from database (super admin)...");
  
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      clinics!inner(name)
    `)
    .order("name");
  
  if (error) {
    console.error("Error fetching all products:", error);
    return [];
  }
  
  console.log("All products data from database:", data);
  console.log("Total products found:", data?.length || 0);
  
  return data || [];
};

export const createProduct = async (product: Omit<Product, 'id' | 'created_at'>): Promise<Product | null> => {
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: product.name,
      description: product.description,
      clinic_id: product.clinic_id
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating product:", error);
    return null;
  }
  
  return data;
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product | null> => {
  const { data, error } = await supabase
    .from("products")
    .update({
      name: product.name,
      description: product.description,
      clinic_id: product.clinic_id
    })
    .eq("id", id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating product:", error);
    return null;
  }
  
  return data;
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);
  
  if (error) {
    console.error("Error deleting product:", error);
    return false;
  }
  
  return true;
};
