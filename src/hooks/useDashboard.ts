
import { useQuery } from "@tanstack/react-query";
import { fetchAllProductMetrics } from "@/services/dashboardService";
import { DashboardFilters } from "@/types/dashboard";

export const useDashboard = (filters: DashboardFilters) => {
  return useQuery({
    queryKey: ["dashboard", filters],
    queryFn: () => fetchAllProductMetrics(filters),
    enabled: filters.clinicIds.length > 0,
  });
};
