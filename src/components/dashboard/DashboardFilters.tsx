
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const clinicOptions = clinics.map(clinic => ({
    value: clinic.id,
    label: clinic.name
  }));

  const handleClinicSelectionChange = (selectedIds: string[]) => {
    onFiltersChange({ ...filters, clinicIds: selectedIds });
  };

  return (
    <div className="w-full mb-6 px-2 sm:px-0">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto">
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
            <CardTitle className="text-white text-sm font-medium">Month</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={filters.month} onValueChange={(value) => onFiltersChange({ ...filters, month: value })}>
              <SelectTrigger className="bg-theme-dark-lighter border-gray-700 text-white">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent className="bg-theme-dark-lighter border-gray-700 z-50">
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value} className="text-white hover:bg-theme-blue/20">
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="bg-theme-dark-card border-gray-800 w-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm font-medium">Year</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={filters.year} onValueChange={(value) => onFiltersChange({ ...filters, year: value })}>
              <SelectTrigger className="bg-theme-dark-lighter border-gray-700 text-white">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent className="bg-theme-dark-lighter border-gray-700 z-50">
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()} className="text-white hover:bg-theme-blue/20">
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
