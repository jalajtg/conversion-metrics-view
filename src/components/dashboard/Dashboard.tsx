
import React, { useState, useEffect } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useClinics } from '@/hooks/useClinics';
import { ProductSection } from './ProductSection';
import { TotalMetricsSection } from './TotalMetricsSection';
import { DashboardFilters } from './DashboardFilters';
import { BookingsSection } from './BookingsSection';
import { FAQSection } from './FAQSection';
import { toast } from '@/hooks/use-toast';
import { Loader2, BarChart } from 'lucide-react';
import type { DashboardFilters as DashboardFiltersType } from '@/types/dashboard';
import { createDummyDataForUser } from '@/services/dummyDataService';

const DASHBOARD_FILTERS_KEY = 'dashboard-filters';

export function Dashboard() {
  const currentDate = new Date();
  
  // Load filters from session storage or use defaults
  const loadFiltersFromStorage = (): DashboardFiltersType => {
    try {
      const savedFilters = sessionStorage.getItem(DASHBOARD_FILTERS_KEY);
      if (savedFilters) {
        const parsed = JSON.parse(savedFilters);
        return {
          clinicIds: parsed.clinicIds || [],
          month: parsed.month || (currentDate.getMonth() + 1).toString(),
          months: parsed.months || []
        };
      }
    } catch (error) {
      console.error('Error loading filters from session storage:', error);
    }
    
    return {
      clinicIds: [],
      month: (currentDate.getMonth() + 1).toString()
    };
  };

  const [filters, setFilters] = useState<DashboardFiltersType>(loadFiltersFromStorage);
  const [dummyDataCreated, setDummyDataCreated] = useState(false);
  
  // Save filters to session storage whenever they change
  const handleFiltersChange = (newFilters: DashboardFiltersType) => {
    setFilters(newFilters);
    try {
      sessionStorage.setItem(DASHBOARD_FILTERS_KEY, JSON.stringify(newFilters));
      console.log('Filters saved to session storage:', newFilters);
    } catch (error) {
      console.error('Error saving filters to session storage:', error);
    }
  };

  const {
    data: clinics,
    isLoading: clinicsLoading,
    error: clinicsError,
    refetch: refetchClinics
  } = useClinics();
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError
  } = useDashboardData(filters);

  // Debug clinic data
  useEffect(() => {
    if (clinics) {
      console.log("Dashboard received clinics:", clinics);
      console.log("Clinic names:", clinics.map(c => c.name));
    }
  }, [clinics]);

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

  // Auto-select all clinics when they're loaded if no clinics are selected in session storage
  // useEffect(() => {
  //   if (clinics && clinics.length > 0 && filters.clinicIds.length === 0) {
  //     console.log("Auto-selecting clinic IDs:", clinics.map(clinic => clinic.id));
  //     handleFiltersChange({
  //       ...filters,
  //       clinicIds: clinics.map(clinic => clinic.id)
  //     });
  //   }
  // }, [clinics, filters.clinicIds.length]);

  useEffect(() => {
    if (clinicsError) {
      toast({
        title: "Error loading clinics",
        description: "There was a problem loading your clinics. Please try again later.",
        variant: "destructive"
      });
    }
    if (dashboardError) {
      toast({
        title: "Error loading dashboard",
        description: "There was a problem loading your dashboard data. Please try again later.",
        variant: "destructive"
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
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold gradient-text">
                Sales Dashboard
              </h1>
              <p className="text-gray-400 text-sm mt-1">Monitor your clinic performance metrics</p>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        {clinics && (
          <div className="mb-6">
            <DashboardFilters clinics={clinics} filters={filters} onFiltersChange={handleFiltersChange} />
          </div>
        )}
        
        {/* Main Content */}
        <div className="space-y-6 lg:space-y-8">
          {filters.clinicIds.length === 0 ? (
            <div className="bg-theme-dark-lighter border border-theme-blue/20 rounded-xl p-6 lg:p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-theme-blue/10 mb-4">
                <BarChart className="h-8 w-8 text-theme-blue" />
              </div>
              <h3 className="text-lg lg:text-xl font-medium text-white mb-2">No clinics selected</h3>
              <p className="text-gray-400 text-sm lg:text-base max-w-md mx-auto">Select one or more clinics to view your dashboard metrics.</p>
            </div>
          ) : (
            <>
              {/* Total Metrics Overview Section */}
              {dashboardData?.products && dashboardData.products.length > 0 && (
                <TotalMetricsSection unifiedData={dashboardData} />
              )}

              {/* Main Dashboard Section */}
              <div className="space-y-6">
                {!dashboardData?.products || dashboardData.products.length === 0 ? (
                  <div className="bg-theme-dark-lighter border border-theme-blue/20 rounded-xl p-6 lg:p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-theme-blue/10 mb-4">
                      <BarChart className="h-8 w-8 text-theme-blue" />
                    </div>
                    <h3 className="text-lg lg:text-xl font-medium text-white mb-2">No data available</h3>
                    <p className="text-gray-400 text-sm lg:text-base max-w-md mx-auto">Start adding products, leads, and sales to see your metrics here.</p>
                  </div>
                ) : (
                  <ProductSection key="unified-products" metrics={null} unifiedData={dashboardData} />
                )}
              </div>

              {/* Bookings Section */}
              <div id="bookings-section">
                <BookingsSection filters={filters} unifiedData={dashboardData} />
              </div>

              {/* FAQ Section */}
              <div id="faq-section">
                <FAQSection filters={filters} unifiedData={dashboardData} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
