
import { supabase } from "@/integrations/supabase/client";
import { Clinic } from "@/types/dashboard";

export const fetchUserClinics = async (): Promise<Clinic[]> => {
  console.log("Fetching user's clinics from database...");
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log("No authenticated user found");
    return [];
  }

  const { data, error } = await supabase
    .from("clinics")
    .select("*")
    .eq("owner_id", user.id)
    .order("name");
  
  if (error) {
    console.error("Error fetching user clinics:", error);
    return [];
  }
  
  console.log("User clinic data from database:", data);
  console.log("Total user clinics found:", data?.length || 0);
  
  return data || [];
};

export const fetchAllClinics = async (): Promise<Clinic[]> => {
  console.log("Fetching all clinics from database...");
  
  const { data, error } = await supabase
    .from("clinics")
    .select(`
      *,
      profiles:owner_id (
        name
      )
    `)
    .order("name");
  
  if (error) {
    console.error("Error fetching all clinics:", error);
    return [];
  }
  
  console.log("All clinic data from database:", data);
  console.log("Total clinics found:", data?.length || 0);
  
  return data || [];
};

export const createClinic = async (clinic: Omit<Clinic, 'id' | 'created_at' | 'updated_at'>): Promise<Clinic | null> => {
  const { data, error } = await supabase
    .from("clinics")
    .insert({
      name: clinic.name,
      email: clinic.email,
      phone: clinic.phone,
      address: clinic.address,
      owner_id: clinic.owner_id
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating clinic:", error);
    return null;
  }
  
  return data;
};

export const updateClinic = async (id: string, clinic: Partial<Clinic>): Promise<Clinic | null> => {
  const { data, error } = await supabase
    .from("clinics")
    .update({
      name: clinic.name,
      email: clinic.email,
      phone: clinic.phone,
      address: clinic.address
    })
    .eq("id", id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating clinic:", error);
    return null;
  }
  
  return data;
};

export const deleteClinic = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from("clinics")
    .delete()
    .eq("id", id);
  
  if (error) {
    console.error("Error deleting clinic:", error);
    return false;
  }
  
  return true;
};
