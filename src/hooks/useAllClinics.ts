
import { useQuery } from "@tanstack/react-query";
import { fetchAllClinics } from "@/services/clinicService";

export const useAllClinics = () => {
  return useQuery({
    queryKey: ["all-clinics"],
    queryFn: fetchAllClinics,
  });
};
