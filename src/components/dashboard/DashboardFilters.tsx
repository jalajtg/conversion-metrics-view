
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown";
import { Clinic } from '@/types/dashboard';
import type { DashboardFilters } from '@/types/dashboard';

interface DashboardFiltersProps {
  clinics: Clinic[];
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
}

export function DashboardFilters({ clinics, filters, onFiltersChange }: DashboardFiltersProps) {
  const months = [
    { value: 'January', label: 'January' },
    { value: 'February', label: 'February' },
    { value: 'March', label: 'March' },
    { value: 'April', label: 'April' },
    { value: 'May', label: 'May' },
    { value: 'June', label: 'June' },
    { value: 'July', label: 'July' },
    { value: 'August', label: 'August' },
    { value: 'September', label: 'September' },
    { value: 'October', label: 'October' },
    { value: 'November', label: 'November' },
    { value: 'December', label: 'December' }
  ];

  const clinicOptions = clinics.map(clinic => ({
    value: clinic.id,
    label: clinic.name
  }));

  const handleClinicSelectionChange = (selectedIds: string[]) => {
    onFiltersChange({ ...filters, clinicIds: selectedIds });
  };

  const handleMonthSelectionChange = (selectedMonths: string[]) => {
    onFiltersChange({ ...filters, months: selectedMonths });
  };

  return (
    <div className="w-full mb-6 px-2 sm:px-0">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 max-w-7xl mx-auto">
        <Card className="bg-theme-dark-card border-gray-800 w-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm font-medium">Select Clinics</CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <MultiSelectDropdown
              options={clinicOptions}
              selectedValues={filters.clinicIds}
              onSelectionChange={handleClinicSelectionChange}
              placeholder="Select clinics..."
              className="w-full"
            />
          </CardContent>
        </Card>

        <Card className="bg-theme-dark-card border-gray-800 w-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm font-medium">Select Months</CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <MultiSelectDropdown
              options={months}
              selectedValues={filters.months || []}
              onSelectionChange={handleMonthSelectionChange}
              placeholder="Select months..."
              className="w-full"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
