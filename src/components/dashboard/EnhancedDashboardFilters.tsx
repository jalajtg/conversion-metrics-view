
import React, { useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Clinic } from '@/types/dashboard';
import type { DashboardFilters } from '@/types/dashboard';
import { FilterHeader } from './filters/FilterHeader';
import { ClinicFilter } from './filters/ClinicFilter';
import { YearFilter } from './filters/YearFilter';
import { MonthFilter } from './filters/MonthFilter';
import { useUserRole } from '@/hooks/useUserRole';

interface EnhancedDashboardFiltersProps {
  clinics: Clinic[];
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  onApplyFilters: () => void;
}

export function EnhancedDashboardFilters({ 
  clinics, 
  filters, 
  onFiltersChange, 
  onApplyFilters 
}: EnhancedDashboardFiltersProps) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const { isSuperAdmin } = useUserRole();

  const handleClinicSelectionChange = useCallback((selectedIds: string[]) => {
    onFiltersChange({ 
      ...filters, 
      clinicIds: selectedIds,
      pendingChanges: true
    });
  }, [filters, onFiltersChange]);

  const handleYearChange = useCallback((year: number) => {
    // When year changes, filter out invalid months
    let updatedMonths = filters.selectedMonths;
    if (year === currentYear) {
      updatedMonths = filters.selectedMonths.filter(month => month <= currentMonth);
    }
    
    onFiltersChange({
      ...filters,
      year: year,
      selectedMonths: updatedMonths,
      pendingChanges: true
    });
  }, [filters, currentYear, currentMonth, onFiltersChange]);

  const handleMonthSelectionChange = useCallback((selectedMonths: number[]) => {
    onFiltersChange({ 
      ...filters, 
      selectedMonths: selectedMonths,
      pendingChanges: true
    });
  }, [filters, onFiltersChange]);

  const handleSelectAllClinics = useCallback(() => {
    // For Super Admin: Set empty array to show ALL data without clinic filtering
    // For Regular users: Select all clinic IDs
    const clinicIds = isSuperAdmin ? [] : clinics.map(clinic => clinic.id);
    
    console.log('Select All Clinics - Super Admin:', isSuperAdmin, 'Setting clinicIds to:', clinicIds);
    
    onFiltersChange({
      ...filters,
      clinicIds: clinicIds,
      pendingChanges: true
    });
  }, [clinics, filters, onFiltersChange, isSuperAdmin]);

  const handleSelectAllMonths = useCallback(() => {
    const availableMonths = filters.year === currentYear 
      ? Array.from({ length: currentMonth }, (_, i) => i + 1)
      : Array.from({ length: 12 }, (_, i) => i + 1);
    
    onFiltersChange({
      ...filters,
      selectedMonths: availableMonths,
      pendingChanges: true
    });
  }, [filters, currentYear, currentMonth, onFiltersChange]);

  const handleClearAll = useCallback(() => {
    onFiltersChange({
      clinicIds: [],
      selectedMonths: [],
      year: currentYear,
      pendingChanges: true
    });
  }, [currentYear, onFiltersChange]);

  const handleApply = useCallback(() => {
    onApplyFilters();
  }, [onApplyFilters]);

  return (
    <Card className="bg-theme-dark-card border-gray-800 shadow-lg">
      <FilterHeader 
        onClearAll={handleClearAll}
        onApply={handleApply}
        hasPendingChanges={filters.pendingChanges}
      />
      <CardContent className="pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ClinicFilter
            clinics={clinics}
            selectedClinicIds={filters.clinicIds}
            onSelectionChange={handleClinicSelectionChange}
            onSelectAll={handleSelectAllClinics}
          />
          
          <YearFilter
            year={filters.year}
            onYearChange={handleYearChange}
          />

          <MonthFilter
            selectedMonths={filters.selectedMonths}
            year={filters.year}
            onSelectionChange={handleMonthSelectionChange}
            onSelectAll={handleSelectAllMonths}
          />
        </div>
        
        {/* Selected Filters Display */}
        <div className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Selected Clinics */}
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Selected Clinics</label>
              <div className="flex flex-wrap gap-2 min-h-[32px]">
                {filters.clinicIds.length > 0 ? (
                  filters.clinicIds.map((clinicId) => {
                    const clinic = clinics.find(c => c.id === clinicId);
                    return clinic ? (
                      <span 
                        key={clinicId}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-theme-blue/20 text-theme-blue border border-theme-blue/30"
                      >
                        {clinic.name}
                      </span>
                    ) : null;
                  })
                ) : (
                  <span className="text-xs text-gray-500 italic">All clinics</span>
                )}
              </div>
            </div>
            
            {/* Selected Year */}
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Selected Year</label>
              <div className="min-h-[32px] flex items-start">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  {filters.year}
                </span>
              </div>
            </div>
            
            {/* Selected Months */}
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Selected Months</label>
              <div className="flex flex-wrap gap-2 min-h-[32px]">
                {filters.selectedMonths.length > 0 && (
                  filters.selectedMonths.map((month) => {
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return (
                      <span 
                        key={month}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      >
                        {monthNames[month - 1]}
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
