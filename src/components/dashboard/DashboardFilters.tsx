
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
    <Card className="bg-theme-dark-card border-gray-800 w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-sm font-medium">Filters</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        {/* Horizontal layout for filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Clinics</label>
            <MultiSelectDropdown
              options={clinicOptions}
              selectedValues={filters.clinicIds}
              onSelectionChange={handleClinicSelectionChange}
              placeholder="Select clinics..."
              className="w-full"
              showChips={false}
            />
          </div>
          
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Months</label>
            <MultiSelectDropdown
              options={months}
              selectedValues={filters.months || []}
              onSelectionChange={handleMonthSelectionChange}
              placeholder="Select months..."
              className="w-full"
              showChips={false}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
