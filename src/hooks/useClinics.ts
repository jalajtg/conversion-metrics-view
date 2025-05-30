
import { useQuery } from "@tanstack/react-query";
import { fetchUserClinics } from "@/services/clinicService";

export const useClinics = () => {
  return useQuery({
    queryKey: ["user-clinics"],
    queryFn: fetchUserClinics,
  });
};
