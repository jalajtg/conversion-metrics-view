import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown";
import { Input } from "@/components/ui/input";
import { useAllClinics } from '@/hooks/useAllClinics';
import type { SuperAdminFilters } from '@/types/admin';

interface SuperAdminFiltersProps {
  filters: SuperAdminFilters;
  onFiltersChange: (filters: SuperAdminFilters) => void;
}

export function SuperAdminFilters({ filters, onFiltersChange }: SuperAdminFiltersProps) {
  const { data: clinics } = useAllClinics();

  const clinicOptions = clinics?.map(clinic => ({
    value: clinic.id,
    label: clinic.name
  })) || [];

  const handleClinicSelectionChange = (selectedIds: string[]) => {
    onFiltersChange({ ...filters, clinicIds: selectedIds });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, startDate: e.target.value });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, endDate: e.target.value });
  };

  return (
    <Card className="bg-theme-dark-card border-gray-800 w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-sm font-medium">Filters</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Clinics</label>
            <MultiSelectDropdown
              options={clinicOptions}
              selectedValues={filters.clinicIds}
              onSelectionChange={handleClinicSelectionChange}
              placeholder="All clinics..."
              className="w-full"
              showChips={false}
            />
          </div>
          
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Start Date</label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={handleStartDateChange}
              className="bg-theme-dark border-gray-700 text-white"
            />
          </div>
          
          <div>
            <label className="text-xs text-gray-400 mb-2 block">End Date</label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={handleEndDateChange}
              className="bg-theme-dark border-gray-700 text-white"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
