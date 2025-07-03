
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedDashboardFilters } from './EnhancedDashboardFilters';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useClinics } from '@/hooks/useClinics';
import { TotalMetricsSection } from './TotalMetricsSection';
import { ProductSection } from './ProductSection';
import { FAQSection } from './FAQSection';
import { BookingsSection } from './BookingsSection';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import type { DashboardFilters } from '@/types/dashboard';

export function Dashboard() {
  const { toast } = useToast();
  const { isSuperAdmin } = useUserRole();
  const { data: clinics = [], isLoading: clinicsLoading } = useClinics();

  // State for filters
  const [filters, setFilters] = useState<DashboardFilters>({
    clinicIds: [],
    selectedMonths: [],
    year: new Date().getFullYear(),
    pendingChanges: false,
  });

  // Auto-select all clinics for super admin
  useEffect(() => {
    if (isSuperAdmin && clinics.length > 0 && filters.clinicIds.length === 0) {
      console.log('Dashboard - Auto-selecting all clinics for super admin:', clinics.length);
      setFilters(prev => ({
        ...prev,
        clinicIds: clinics.map(clinic => clinic.id),
        appliedFilters: {
          clinicIds: clinics.map(clinic => clinic.id),
          selectedMonths: prev.selectedMonths,
          year: prev.year,
        },
        pendingChanges: false
      }));
    }
  }, [isSuperAdmin, clinics, filters.clinicIds.length]);

  const { data: unifiedData, isLoading, error } = useDashboardData(filters);

  console.log('Dashboard - Current filters:', filters);
  console.log('Dashboard - Unified data:', unifiedData);
  console.log('Dashboard - Is super admin:', isSuperAdmin);
  console.log('Dashboard - Selected clinics count:', filters.clinicIds.length);

  const handleFiltersChange = (newFilters: DashboardFilters) => {
    console.log('Dashboard - Filters changed:', newFilters);
    setFilters(newFilters);
  };

  if (clinicsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-theme-blue" />
      </div>
    );
  }

  if (error) {
    console.error('Dashboard error:', error);
    toast({
      title: "Error loading dashboard",
      description: "Please try refreshing the page",
      variant: "destructive",
    });
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/4">
          <EnhancedDashboardFilters
            clinics={clinics}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isSuperAdmin={isSuperAdmin}
          />
        </div>

        <div className="lg:w-3/4 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-theme-blue" />
            </div>
          ) : (
            <>
              {/* Total Metrics Section */}
              <TotalMetricsSection unifiedData={unifiedData} />

              {/* Product Section */}
              <ProductSection unifiedData={unifiedData} />

              {/* FAQ Section */}
              <FAQSection unifiedData={unifiedData} />

              {/* Bookings Section */}
              <BookingsSection unifiedData={unifiedData} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
