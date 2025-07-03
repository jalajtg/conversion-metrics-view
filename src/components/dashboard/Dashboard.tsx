
import React, { useState, useEffect } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useClinics } from '@/hooks/useClinics';
import { useAllClinics } from '@/hooks/useAllClinics';
import { useUserRole } from '@/hooks/useUserRole';
import { ProductSection } from './ProductSection';
import { TotalMetricsSection } from './TotalMetricsSection';
import { EnhancedDashboardFilters } from './EnhancedDashboardFilters';
import { BookingsSection } from './BookingsSection';
import { FAQSection } from './FAQSection';
import { toast } from '@/hooks/use-toast';
import { Loader2, BarChart } from 'lucide-react';
import type { DashboardFilters } from '@/types/dashboard';
import { createDummyDataForUser } from '@/services/dummyDataService';

const DASHBOARD_FILTERS_KEY = 'dashboard-enhanced-filters';

export function Dashboard() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentYear = currentDate.getFullYear();
  
  // Check if user is super admin
  const { isSuperAdmin } = useUserRole();
  
  // Load filters from session storage or use defaults
  const loadFiltersFromStorage = (): DashboardFilters => {
    try {
      const savedFilters = sessionStorage.getItem(DASHBOARD_FILTERS_KEY);
      if (savedFilters) {
        const parsed = JSON.parse(savedFilters);
        return {
          clinicIds: parsed.clinicIds || [],
          selectedMonths: parsed.selectedMonths || [currentMonth],
          year: parsed.year || currentYear,
          pendingChanges: false,
          appliedFilters: parsed.appliedFilters
        };
      }
    } catch (error) {
      console.error('Error loading filters from session storage:', error);
    }
    
    return {
      clinicIds: [],
      selectedMonths: [currentMonth],
      year: currentYear,
      pendingChanges: false
    };
  };

  const [filters, setFilters] = useState<DashboardFilters>(loadFiltersFromStorage);
  const [dummyDataCreated, setDummyDataCreated] = useState(false);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  
  // Save filters to session storage whenever they change
  const handleFiltersChange = (newFilters: DashboardFilters) => {
    setFilters(newFilters);
    try {
      sessionStorage.setItem(DASHBOARD_FILTERS_KEY, JSON.stringify(newFilters));
    } catch (error) {
      console.error('Error saving filters to session storage:', error);
    }
  };

  // Handle apply filters
  const handleApplyFilters = () => {
    const appliedFilters = {
      clinicIds: filters.clinicIds,
      selectedMonths: filters.selectedMonths,
      year: filters.year
    };
    
    const updatedFilters = {
      ...filters,
      appliedFilters,
      pendingChanges: false
    };
    
    setFilters(updatedFilters);
    try {
      sessionStorage.setItem(DASHBOARD_FILTERS_KEY, JSON.stringify(updatedFilters));
    } catch (error) {
      console.error('Error saving applied filters to session storage:', error);
    }
  };

  // Use different hooks based on user role
  const {
    data: userClinics,
    isLoading: userClinicsLoading,
    error: userClinicsError,
    refetch: refetchUserClinics
  } = useClinics();

  const {
    data: allClinics,
    isLoading: allClinicsLoading,
    error: allClinicsError
  } = useAllClinics();

  // Determine which clinics data to use
  const clinics = isSuperAdmin ? allClinics : userClinics;
  const clinicsLoading = isSuperAdmin ? allClinicsLoading : userClinicsLoading;
  const clinicsError = isSuperAdmin ? allClinicsError : userClinicsError;
  const refetchClinics = isSuperAdmin ? () => {} : refetchUserClinics;

  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError
  } = useDashboardData(filters);

  // Create dummy data if no clinics exist (only for regular users)
  useEffect(() => {
    const createDummyData = async () => {
      if (!isSuperAdmin && !clinicsLoading && clinics && clinics.length === 0 && !dummyDataCreated) {
        console.log('No clinics found, creating dummy data...');
        setDummyDataCreated(true);
        await createDummyDataForUser();
        refetchClinics();
      }
    };
    createDummyData();
  }, [clinics, clinicsLoading, dummyDataCreated, refetchClinics, isSuperAdmin]);

  // Auto-select all clinics when they're loaded for the first time
  useEffect(() => {
    if (clinics && clinics.length > 0 && !hasAutoSelected) {
      const savedFilters = sessionStorage.getItem(DASHBOARD_FILTERS_KEY);
      
      if (!savedFilters) {
        // No saved filters, auto-select all clinics
        console.log("Auto-selecting all clinics");
        const allClinicIds = clinics.map(clinic => clinic.id);
        const newFilters = {
          clinicIds: allClinicIds,
          selectedMonths: [currentMonth],
          year: currentYear,
          pendingChanges: false,
          appliedFilters: {
            clinicIds: allClinicIds,
            selectedMonths: [currentMonth],
            year: currentYear
          }
        };
        handleFiltersChange(newFilters);
      }
      setHasAutoSelected(true);
    }
  }, [clinics, hasAutoSelected, currentMonth, currentYear]);

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
                {isSuperAdmin ? 'Super Admin Dashboard' : 'Sales Dashboard'}
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {isSuperAdmin ? 'Monitor all clinic performance metrics' : 'Monitor your clinic performance metrics'}
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Filters Section */}
        {clinics && (
          <div className="mb-6">
            <EnhancedDashboardFilters 
              clinics={clinics} 
              filters={filters} 
              onFiltersChange={handleFiltersChange}
              onApplyFilters={handleApplyFilters}
            />
          </div>
        )}
        
        {/* Main Content */}
        <div className="space-y-6 lg:space-y-8">
          {!filters.appliedFilters || filters.appliedFilters.clinicIds.length === 0 ? (
            <div className="bg-theme-dark-lighter border border-theme-blue/20 rounded-xl p-6 lg:p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-theme-blue/10 mb-4">
                <BarChart className="h-8 w-8 text-theme-blue" />
              </div>
              <h3 className="text-lg lg:text-xl font-medium text-white mb-2">No clinics selected</h3>
              <p className="text-gray-400 text-sm lg:text-base max-w-md mx-auto">Select one or more clinics and click Apply to view your dashboard metrics.</p>
            </div>
          ) : (
            <>
              {/* Total Metrics Overview Section - Show if we have any data */}
              {dashboardData && (
                <TotalMetricsSection unifiedData={dashboardData} />
              )}

              {/* Main Dashboard Section */}
              <div className="space-y-6">
                {!dashboardData?.products || dashboardData.products.length === 0 ? (
                  <div className="bg-theme-dark-lighter border border-theme-blue/20 rounded-xl p-6 lg:p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-theme-blue/10 mb-4">
                      <BarChart className="h-8 w-8 text-theme-blue" />
                    </div>
                    <h3 className="text-lg lg:text-xl font-medium text-white mb-2">No products available</h3>
                    <p className="text-gray-400 text-sm lg:text-base max-w-md mx-auto">Add products to see detailed product metrics here.</p>
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
