
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

export const fetchAllClinics = async (): Promise<any[]> => {
  console.log("Fetching all clinics from database...");
  
  // Fetch all clinics without any filtering
  const { data: clinicsData, error: clinicsError } = await supabase
    .from("clinics")
    .select("*")
    .order("name");
  
  if (clinicsError) {
    console.error("Error fetching all clinics:", clinicsError);
    return [];
  }

  if (!clinicsData || clinicsData.length === 0) {
    console.log("No clinics found");
    return [];
  }

  // Get all unique owner IDs
  const ownerIds = [...new Set(clinicsData.map(clinic => clinic.owner_id))];
  
  // Fetch profiles for all owners
  const { data: profilesData, error: profilesError } = await supabase
    .from("profiles")
    .select("id, name")
    .in("id", ownerIds);

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError);
    // Return clinics without profile data if profiles fetch fails
    return clinicsData.map(clinic => ({
      ...clinic,
      profiles: null
    }));
  }

  // Create a map of profiles for easy lookup
  const profilesMap = new Map(profilesData?.map(profile => [profile.id, profile]) || []);

  // Combine clinics with their owner profiles
  const clinicsWithProfiles = clinicsData.map(clinic => ({
    ...clinic,
    profiles: profilesMap.get(clinic.owner_id) || null
  }));
  
  console.log("All clinic data with profiles:", clinicsWithProfiles);
  console.log("Total clinics found:", clinicsWithProfiles.length);
  
  return clinicsWithProfiles;
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
