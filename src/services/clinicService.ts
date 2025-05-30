
import { supabase } from "@/integrations/supabase/client";
import { Clinic } from "@/types/dashboard";

export const fetchUserClinics = async (): Promise<Clinic[]> => {
  console.log("Fetching clinics from database...");
  
  const { data, error } = await supabase
    .from("clinics")
    .select("*")
    .order("name");
  
  if (error) {
    console.error("Error fetching clinics:", error);
    return [];
  }
  
  console.log("Raw clinic data from database:", data);
  console.log("Number of clinics found:", data?.length || 0);
  
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
