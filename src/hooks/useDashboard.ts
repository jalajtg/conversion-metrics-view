
import { useQuery } from "@tanstack/react-query";
import { fetchAllProductMetrics } from "@/services/dashboardService";

export const useDashboard = () => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchAllProductMetrics,
  });
};
