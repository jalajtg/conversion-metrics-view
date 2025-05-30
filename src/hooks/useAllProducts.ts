
import { useQuery } from "@tanstack/react-query";
import { fetchAllProducts } from "@/services/productService";

export const useAllProducts = () => {
  return useQuery({
    queryKey: ["all-products"],
    queryFn: fetchAllProducts,
  });
};
