
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
  success: boolean;
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
  console.log('Starting replication from clinic:', sourceClinicId);
  
  try {
    // First, get all products from the source clinic
    const { data: sourceProducts, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('clinic_id', sourceClinicId);

    if (productsError) {
      console.error('Error fetching source products:', productsError);
      throw productsError;
    }

    console.log('Source products found:', sourceProducts?.length || 0);

    if (!sourceProducts || sourceProducts.length === 0) {
      throw new Error('No products found in source clinic');
    }

    // Get all clinics except the source clinic
    const { data: targetClinics, error: clinicsError } = await supabase
      .from('clinics')
      .select('*')
      // .neq('id', sourceClinicId);

    if (clinicsError) {
      console.error('Error fetching target clinics:', clinicsError);
      throw clinicsError;
    }

    console.log('Target clinics found:', targetClinics?.length || 0);

    if (!targetClinics || targetClinics.length === 0) {
      throw new Error('No target clinics found');
    }

    const results: ReplicationResult[] = [];

    // Replicate to each target clinic
    for (const clinic of targetClinics) {
      try {
        console.log(`Replicating to clinic: ${clinic.name} (${clinic.id})`);
        
        // Prepare products for insertion (remove id, created_at, and update clinic_id)
        const productsToInsert = sourceProducts.map(product => ({
          name: product.name,
          description: product.description,
          clinic_id: clinic.id
        }));

        // Check for existing products to avoid duplicates
        const { data: existingProducts, error: existingError } = await supabase
          .from('products')
          .select('name')
          .eq('clinic_id', clinic.id);

        if (existingError) {
          console.error('Error checking existing products:', existingError);
          results.push({
            target_clinic_id: clinic.id,
            clinic_name: clinic.name,
            products_replicated: 0,
            success: false
          });
          continue;
        }

        const existingProductNames = new Set(existingProducts?.map(p => p.name) || []);
        
        // Filter out products that already exist
        const newProducts = productsToInsert.filter(product => 
          !existingProductNames.has(product.name)
        );

        console.log(`New products to insert for ${clinic.name}:`, newProducts.length);

        if (newProducts.length > 0) {
          const { error: insertError } = await supabase
            .from('products')
            .insert(newProducts);

          if (insertError) {
            console.error(`Error inserting products for clinic ${clinic.name}:`, insertError);
            results.push({
              target_clinic_id: clinic.id,
              clinic_name: clinic.name,
              products_replicated: 0,
              success: false
            });
          } else {
            console.log(`Successfully inserted ${newProducts.length} products for ${clinic.name}`);
            results.push({
              target_clinic_id: clinic.id,
              clinic_name: clinic.name,
              products_replicated: newProducts.length,
              success: true
            });
          }
        } else {
          console.log(`No new products to insert for ${clinic.name}`);
          results.push({
            target_clinic_id: clinic.id,
            clinic_name: clinic.name,
            products_replicated: 0,
            success: true
          });
        }
      } catch (clinicError) {
        console.error(`Error replicating to clinic ${clinic.name}:`, clinicError);
        results.push({
          target_clinic_id: clinic.id,
          clinic_name: clinic.name,
          products_replicated: 0,
          success: false
        });
      }
    }

    console.log('Replication completed. Results:', results);
    return results;
  } catch (error) {
    console.error('Error in replication process:', error);
    throw error;
  }
};

export const replicateProductsToSpecificClinic = async (
  sourceClinicId: string, 
  targetClinicId: string
): Promise<number> => {
  console.log('Replicating products from', sourceClinicId, 'to', targetClinicId);
  
  try {
    // Get all products from the source clinic
    const { data: sourceProducts, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('clinic_id', sourceClinicId);

    if (productsError) {
      console.error('Error fetching source products:', productsError);
      throw productsError;
    }

    if (!sourceProducts || sourceProducts.length === 0) {
      console.log('No products found in source clinic');
      return 0;
    }

    // Check for existing products in target clinic to avoid duplicates
    const { data: existingProducts, error: existingError } = await supabase
      .from('products')
      .select('name')
      .eq('clinic_id', targetClinicId);

    if (existingError) {
      console.error('Error checking existing products:', existingError);
      throw existingError;
    }

    const existingProductNames = new Set(existingProducts?.map(p => p.name) || []);
    
    // Prepare products for insertion (remove id, created_at, and update clinic_id)
    const productsToInsert = sourceProducts
      .filter(product => !existingProductNames.has(product.name))
      .map(product => ({
        name: product.name,
        description: product.description,
        clinic_id: targetClinicId
      }));

    console.log('Products to insert:', productsToInsert.length);

    if (productsToInsert.length === 0) {
      console.log('No new products to insert');
      return 0;
    }

    const { error: insertError } = await supabase
      .from('products')
      .insert(productsToInsert);

    if (insertError) {
      console.error('Error inserting products:', insertError);
      throw insertError;
    }

    console.log('Products replicated successfully:', productsToInsert.length);
    return productsToInsert.length;
  } catch (error) {
    console.error('Error in specific clinic replication:', error);
    throw error;
  }
};
