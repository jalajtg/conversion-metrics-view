
import { supabase } from "@/integrations/supabase/client";
import { Clinic } from "@/types/dashboard";

export const fetchUserClinics = async (): Promise<Clinic[]> => {
  console.log("Fetching clinics from database...");
  
  // Get current user first
  const { data: { user } } = await supabase.auth.getUser();
  console.log("Current user ID:", user?.id);
  
  // First, let's see all clinics in the database
  const { data: allClinics, error: allClinicsError } = await supabase
    .from("clinics")
    .select("*")
    .order("name");
  
  console.log("All clinics in database:", allClinics);
  console.log("Total clinics count:", allClinics?.length || 0);
  
  if (allClinicsError) {
    console.error("Error fetching all clinics:", allClinicsError);
  }
  
  // Now fetch user-specific clinics
  const { data, error } = await supabase
    .from("clinics")
    .select("*")
    .eq("owner_id", user?.id)
    .order("name");
  
  if (error) {
    console.error("Error fetching user clinics:", error);
    return [];
  }
  
  console.log("User-specific clinic data from database:", data);
  console.log("User clinics count:", data?.length || 0);
  
  // Let's also check what owner_ids exist in the clinics
  const { data: ownerIds } = await supabase
    .from("clinics")
    .select("owner_id")
    .order("owner_id");
  
  console.log("All owner_ids in clinics table:", ownerIds);
  
  return data || [];
};

export const createClinic = async (clinic: Omit<Clinic, 'id' | 'owner_id' | 'created_at' | 'updated_at'>): Promise<Clinic | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error("User not authenticated");
    return null;
  }

  const { data, error } = await supabase
    .from("clinics")
    .insert({
      ...clinic,
      owner_id: user.id
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating clinic:", error);
    return null;
  }
  
  return data;
};
