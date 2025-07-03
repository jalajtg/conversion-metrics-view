
import React, { useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Clinic } from '@/types/dashboard';
import type { DashboardFilters } from '@/types/dashboard';
import { FilterHeader } from './filters/FilterHeader';
import { ClinicFilter } from './filters/ClinicFilter';
import { YearFilter } from './filters/YearFilter';
import { MonthFilter } from './filters/MonthFilter';

interface EnhancedDashboardFiltersProps {
  clinics: Clinic[];
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  onApplyFilters: () => void;
  isSuperAdmin?: boolean;
}

export function EnhancedDashboardFilters({ 
  clinics, 
  filters, 
  onFiltersChange, 
  onApplyFilters,
  isSuperAdmin = false
}: EnhancedDashboardFiltersProps) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

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
    const allClinicIds = clinics.map(clinic => clinic.id);
    onFiltersChange({
      ...filters,
      clinicIds: allClinicIds,
      pendingChanges: true
    });
  }, [clinics, filters, onFiltersChange]);

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
      </CardContent>
    </Card>
  );
}
