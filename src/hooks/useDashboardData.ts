import { useQuery } from "@tanstack/react-query";
import { useUserRole } from "@/hooks/useUserRole";
import type { DashboardFilters } from "@/types/dashboard";
import { fetchDashboardData } from "@/services/dashboardDataService";

export const useDashboardData = (filters: DashboardFilters) => {
  const { isSuperAdmin } = useUserRole();
  
  return useQuery({
    queryKey: ["dashboard-enhanced", filters.appliedFilters, isSuperAdmin],
    queryFn: () => {
      const filtersToUse: DashboardFilters = filters.appliedFilters ? {
        ...filters.appliedFilters,
        pendingChanges: false
      } : {
        clinicIds: filters.clinicIds,
        selectedMonths: filters.selectedMonths,
        year: filters.year,
        pendingChanges: false
      };
      return fetchDashboardData(filtersToUse, isSuperAdmin);
    },
    enabled: isSuperAdmin || (filters.appliedFilters?.clinicIds.length || 0) > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes,
  });
};