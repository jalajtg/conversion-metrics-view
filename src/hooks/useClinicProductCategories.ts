
import { useQuery } from "@tanstack/react-query";
import { fetchClinicProductCategories } from "@/services/clinicProductCategoryService";

export const useClinicProductCategories = (clinicId: string) => {
  return useQuery({
    queryKey: ["clinic-product-categories", clinicId],
    queryFn: () => fetchClinicProductCategories(clinicId),
    enabled: !!clinicId,
  });
};
