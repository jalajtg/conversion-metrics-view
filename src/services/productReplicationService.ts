
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
  console.log('Fetching clinic product counts...');
  
  const { data, error } = await supabase
    .from('clinics')
    .select(`
      id,
      name,
      products(id)
    `);

  if (error) {
    console.error('Error fetching clinic product counts:', error);
    throw error;
  }

  console.log('Raw clinic data:', data);

  // Transform the data to get product counts
  const clinicCounts = data.map(clinic => ({
    id: clinic.id,
    name: clinic.name,
    product_count: clinic.products?.length || 0
  }));

  console.log('Transformed clinic counts:', clinicCounts);

  // Sort by product count descending
  return clinicCounts.sort((a, b) => b.product_count - a.product_count);
};

export const replicateProductsToAllClinics = async (sourceClinicId: string): Promise<ReplicationResult[]> => {
  console.log('Replicating products to all clinics from:', sourceClinicId);
  
  const { data, error } = await supabase.rpc('replicate_products_to_all_clinics', {
    source_clinic_id: sourceClinicId
  });

  if (error) {
    console.error('Error replicating products to all clinics:', error);
    throw error;
  }

  console.log('Replication results:', data);
  return data || [];
};

export const replicateProductsToSpecificClinic = async (
  sourceClinicId: string, 
  targetClinicId: string
): Promise<number> => {
  console.log('Replicating products from', sourceClinicId, 'to', targetClinicId);
  
  const { data, error } = await supabase.rpc('replicate_products_to_clinic', {
    source_clinic_id: sourceClinicId,
    target_clinic_id: targetClinicId
  });

  if (error) {
    console.error('Error replicating products to specific clinic:', error);
    throw error;
  }

  console.log('Products replicated count:', data);
  return data || 0;
};
