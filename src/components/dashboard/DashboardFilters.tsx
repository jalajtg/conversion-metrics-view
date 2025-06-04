
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

  console.log("DashboardFilters - received clinics:", clinics);
  console.log("DashboardFilters - clinic options created:", clinicOptions);

  const handleClinicSelectionChange = (selectedIds: string[]) => {
    onFiltersChange({ ...filters, clinicIds: selectedIds });
  };

  const handleMonthSelectionChange = (selectedMonths: string[]) => {
    onFiltersChange({ ...filters, months: selectedMonths });
  };

  return (
    <Card className="bg-theme-dark-card border-gray-800 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg font-semibold">Filters</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Clinics</label>
            <MultiSelectDropdown
              options={clinicOptions}
              selectedValues={filters.clinicIds}
              onSelectionChange={handleClinicSelectionChange}
              placeholder="Select clinics..."
              className="w-full bg-theme-dark border-gray-700 text-white"
              showChips={false}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Months</label>
            <MultiSelectDropdown
              options={months}
              selectedValues={filters.months || []}
              onSelectionChange={handleMonthSelectionChange}
              placeholder="Select months..."
              className="w-full bg-theme-dark border-gray-700 text-white"
              showChips={false}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
