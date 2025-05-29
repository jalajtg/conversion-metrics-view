
import { supabase } from "@/integrations/supabase/client";

interface ClinicProductCount {
  id: string;
  name: string;
  product_count: number;
}

interface ReplicationResult {
  target_clinic_id: string;
  clinic_name: string;
  products_replicated: number;
}

export const getClinicProductCounts = async (): Promise<ClinicProductCount[]> => {
  const { data, error } = await supabase
    .from('clinics')
    .select(`
      id,
      name,
      products!inner(id)
    `);

  if (error) {
    console.error('Error fetching clinic product counts:', error);
    throw error;
  }

  // Transform the data to get product counts
  const clinicCounts = data.map(clinic => ({
    id: clinic.id,
    name: clinic.name,
    product_count: clinic.products?.length || 0
  }));

  // Sort by product count descending
  return clinicCounts.sort((a, b) => b.product_count - a.product_count);
};

export const replicateProductsToAllClinics = async (sourceClinicId: string): Promise<ReplicationResult[]> => {
  const { data, error } = await supabase.rpc('replicate_products_to_all_clinics', {
    source_clinic_id: sourceClinicId
  });

  if (error) {
    console.error('Error replicating products:', error);
    throw error;
  }

  return data || [];
};

export const replicateProductsToSpecificClinic = async (
  sourceClinicId: string, 
  targetClinicId: string
): Promise<number> => {
  const { data, error } = await supabase.rpc('replicate_products_to_clinic', {
    source_clinic_id: sourceClinicId,
    target_clinic_id: targetClinicId
  });

  if (error) {
    console.error('Error replicating products to specific clinic:', error);
    throw error;
  }

  return data || 0;
};
