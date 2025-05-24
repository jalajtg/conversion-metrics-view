import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { useClinics } from '@/hooks/useClinics';
import { ProductSection } from './ProductSection';
import { DashboardFilters } from './DashboardFilters';
import { BookingsSection } from './BookingsSection';
import { FAQSection } from './FAQSection';
import { toast } from '@/hooks/use-toast';
import { Loader2, BarChart } from 'lucide-react';
import type { DashboardFilters as DashboardFiltersType } from '@/types/dashboard';
import { createDummyDataForUser } from '@/services/dummyDataService';

export function Dashboard() {
  const currentDate = new Date();
  const [filters, setFilters] = useState<DashboardFiltersType>({
    clinicIds: [],
    month: (currentDate.getMonth() + 1).toString(),
    year: currentDate.getFullYear().toString()
  });
  const [dummyDataCreated, setDummyDataCreated] = useState(false);

  const { data: clinics, isLoading: clinicsLoading, error: clinicsError, refetch: refetchClinics } = useClinics();
  const { data: productMetrics, isLoading: dashboardLoading, error: dashboardError } = useDashboard(filters);

  // Create dummy data if no clinics exist
  useEffect(() => {
    const createDummyData = async () => {
      if (!clinicsLoading && clinics && clinics.length === 0 && !dummyDataCreated) {
        console.log('No clinics found, creating dummy data...');
        setDummyDataCreated(true);
        await createDummyDataForUser();
        // Refetch clinics after creating dummy data
        refetchClinics();
      }
    };

    createDummyData();
  }, [clinics, clinicsLoading, dummyDataCreated, refetchClinics]);

  // Auto-select all clinics when they're loaded
  useEffect(() => {
    if (clinics && clinics.length > 0 && filters.clinicIds.length === 0) {
      setFilters(prev => ({
        ...prev,
        clinicIds: clinics.map(clinic => clinic.id)
      }));
    }
  }, [clinics, filters.clinicIds.length]);

  useEffect(() => {
    if (clinicsError) {
      toast({
        title: "Error loading clinics",
        description: "There was a problem loading your clinics. Please try again later.",
        variant: "destructive",
      });
    }
    if (dashboardError) {
      toast({
        title: "Error loading dashboard",
        description: "There was a problem loading your dashboard data. Please try again later.",
        variant: "destructive",
      });
    }
  }, [clinicsError, dashboardError]);

  const isLoading = clinicsLoading || dashboardLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] px-4">
        <Loader2 className="h-12 w-12 text-theme-blue animate-spin" />
        <p className="mt-4 text-gray-400 text-center">Loading your dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-theme-dark">
      <div className="container mx-auto py-4 sm:py-8 px-4 max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 gradient-text">Sales Dashboard</h1>
          <p className="text-gray-400 text-sm sm:text-base">Track your sales metrics across all clinics and products</p>
        </div>
        
        {clinics && (
          <DashboardFilters
            clinics={clinics}
            filters={filters}
            onFiltersChange={setFilters}
          />
        )}
        
        <div className="px-2 sm:px-0 space-y-12">
          {filters.clinicIds.length === 0 ? (
            <div className="bg-theme-dark-lighter border border-theme-blue/20 rounded-xl p-6 sm:p-8 text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-theme-blue/10 mb-4">
                <BarChart className="h-8 w-8 text-theme-blue" />
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-white mb-2">No clinics selected</h3>
              <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto">Select one or more clinics to view your dashboard metrics.</p>
            </div>
          ) : (
            <>
              {/* Main Dashboard Section */}
              <div className="space-y-6">
                {productMetrics?.length === 0 ? (
                  <div className="bg-theme-dark-lighter border border-theme-blue/20 rounded-xl p-6 sm:p-8 text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-theme-blue/10 mb-4">
                      <BarChart className="h-8 w-8 text-theme-blue" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-medium text-white mb-2">No data available</h3>
                    <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto">Start adding products, leads, and sales to see your metrics here.</p>
                  </div>
                ) : (
                  productMetrics?.map((metrics) => (
                    <ProductSection key={metrics.product.id} metrics={metrics} />
                  ))
                )}
              </div>

              {/* Bookings Section */}
              <BookingsSection filters={filters} />

              {/* FAQ Section */}
              <FAQSection filters={filters} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
