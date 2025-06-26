
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown";
import { Clinic } from '@/types/dashboard';
import type { DashboardFilters } from '@/types/dashboard';
import { useDebounce } from '@/hooks/useDebounce';

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
  const [localYear, setLocalYear] = useState(filters.year.toString());
  const debouncedYear = useDebounce(localYear, 500);
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const clinicOptions = clinics.map(clinic => ({
    value: clinic.id,
    label: clinic.name
  }));

  // Filter months based on selected year
  const availableMonths = filters.year === currentYear 
    ? months.filter(month => parseInt(month.value) <= currentMonth)
    : months;

  // Handle debounced year change
  useEffect(() => {
    const yearNum = parseInt(debouncedYear);
    if (!isNaN(yearNum) && yearNum >= 2020 && yearNum <= 2025 && yearNum !== filters.year) {
      // When year changes, filter out invalid months
      let updatedMonths = filters.selectedMonths;
      if (yearNum === currentYear) {
        updatedMonths = filters.selectedMonths.filter(month => month <= currentMonth);
      }
      
      onFiltersChange({
        ...filters,
        year: yearNum,
        selectedMonths: updatedMonths,
        pendingChanges: true
      });
    }
  }, [debouncedYear, filters, currentYear, currentMonth, onFiltersChange]);

  const handleClinicSelectionChange = useCallback((selectedIds: string[]) => {
    onFiltersChange({ 
      ...filters, 
      clinicIds: selectedIds,
      pendingChanges: true
    });
  }, [filters, onFiltersChange]);

  const handleMonthSelectionChange = useCallback((selectedMonths: string[]) => {
    const numericMonths = selectedMonths.map(month => parseInt(month));
    onFiltersChange({ 
      ...filters, 
      selectedMonths: numericMonths,
      pendingChanges: true
    });
  }, [filters, onFiltersChange]);

  const handleYearChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalYear(value);
  }, []);

  const handleSelectAllClinics = useCallback(() => {
    const allClinicIds = clinics.map(clinic => clinic.id);
    onFiltersChange({
      ...filters,
      clinicIds: allClinicIds,
      pendingChanges: true
    });
  }, [clinics, filters, onFiltersChange]);

  const handleSelectAllMonths = useCallback(() => {
    const allAvailableMonths = availableMonths.map(month => parseInt(month.value));
    onFiltersChange({
      ...filters,
      selectedMonths: allAvailableMonths,
      pendingChanges: true
    });
  }, [availableMonths, filters, onFiltersChange]);

  const handleClearAll = useCallback(() => {
    onFiltersChange({
      clinicIds: [],
      selectedMonths: [],
      year: currentYear,
      pendingChanges: true
    });
    setLocalYear(currentYear.toString());
  }, [currentYear, onFiltersChange]);

  const handleApply = useCallback(() => {
    onApplyFilters();
  }, [onApplyFilters]);

  return (
    <Card className="bg-theme-dark-card border-gray-800 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg font-semibold">Filters</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Clear All
            </Button>
            <Button
              onClick={handleApply}
              disabled={!filters.pendingChanges}
              className="text-sm bg-theme-blue hover:bg-theme-blue/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Clinics Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Clinics</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAllClinics}
                className="text-xs text-gray-400 hover:text-white h-auto py-1 px-2"
              >
                Select All
              </Button>
            </div>
            <MultiSelectDropdown
              options={clinicOptions}
              selectedValues={filters.clinicIds}
              onSelectionChange={handleClinicSelectionChange}
              placeholder="Select clinics..."
              className="w-full bg-theme-dark border-gray-700 text-white rounded"
              showChips={false}
            />
          </div>
          
          {/* Year Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Year</label>
            <Input
              type="number"
              value={localYear}
              onChange={handleYearChange}
              min={2020}
              max={2025}
              className="w-full bg-theme-dark border-gray-700 text-white"
              placeholder="Enter year"
            />
          </div>

          {/* Months Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Months</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAllMonths}
                className="text-xs text-gray-400 hover:text-white h-auto py-1 px-2"
              >
                Select All
              </Button>
            </div>
            <MultiSelectDropdown
              options={availableMonths}
              selectedValues={filters.selectedMonths.map(m => m.toString())}
              onSelectionChange={handleMonthSelectionChange}
              placeholder="Select months..."
              className="w-full bg-theme-dark border-gray-700 text-white rounded"
              showChips={false}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
