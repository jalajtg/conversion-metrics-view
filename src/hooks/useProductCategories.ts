
import { useQuery } from "@tanstack/react-query";
import { fetchAllProductCategories } from "@/services/clinicProductCategoryService";

export const useProductCategories = () => {
  return useQuery({
    queryKey: ["product-categories"],
    queryFn: fetchAllProductCategories,
  });
};
