import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clinic } from '@/types/dashboard';
import type { DashboardFilters } from '@/types/dashboard';
import { BookingTimeFilter } from './filters/BookingTimeFilter';

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

  console.log("DashboardFilters - received clinics:", clinics);
  console.log("DashboardFilters - clinic options created:", clinicOptions);
  console.log("DashboardFilters - current filters:", filters);

  const handleClinicSelectionChange = (selectedIds: string[]) => {
    onFiltersChange({ ...filters, clinicIds: selectedIds, pendingChanges: true });
  };

  const handleMonthSelectionChange = (selectedMonths: string[]) => {
    const numericMonths = selectedMonths.map(month => parseInt(month));
    onFiltersChange({ ...filters, selectedMonths: numericMonths, pendingChanges: true });
  };

  const handleYearChange = (year: string) => {
    onFiltersChange({ ...filters, year: parseInt(year), pendingChanges: true });
  };

  const handleClearAll = () => {
    onFiltersChange({
      clinicIds: [],
      selectedMonths: [],
      year: currentYear,
      pendingChanges: true
    });
  };

  const handleBookingStartDateChange = (date: string) => {
    onFiltersChange({
      ...filters,
      bookingStartDate: date,
      pendingChanges: true
    });
  };

  const handleBookingEndDateChange = (date: string) => {
    onFiltersChange({
      ...filters,
      bookingEndDate: date,
      pendingChanges: true
    });
  };

  return (
    <div className="space-y-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg font-semibold">Filters</CardTitle>
          <button
            onClick={handleClearAll}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Clear All
          </button>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Clinics</label>
            <MultiSelectDropdown
              options={clinicOptions}
              selectedValues={filters.clinicIds}
              onSelectionChange={handleClinicSelectionChange}
              placeholder="Select clinics..."
              className="w-full bg-theme-dark border-gray-700 text-white rounded"
              showChips={false}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Months</label>
            <MultiSelectDropdown
              options={months}
              selectedValues={(filters.selectedMonths || []).map(m => m.toString())}
              onSelectionChange={handleMonthSelectionChange}
              placeholder="Select months..."
              className="w-full bg-theme-dark border-gray-700 text-white rounded"
              showChips={false}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Year</label>
            <Select value={filters.year?.toString() || currentYear.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-full bg-theme-dark border-gray-700 text-white">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent className="bg-theme-dark border-gray-700">
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()} className="text-white hover:bg-gray-700">
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <BookingTimeFilter
            startDate={filters.bookingStartDate}
            endDate={filters.bookingEndDate}
            onStartDateChange={handleBookingStartDateChange}
            onEndDateChange={handleBookingEndDateChange}
          />
        </div>
      </CardContent>
    </div>
  );
}
