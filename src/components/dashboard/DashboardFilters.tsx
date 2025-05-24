
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const handleClinicToggle = (clinicId: string, checked: boolean) => {
    const newClinicIds = checked
      ? [...filters.clinicIds, clinicId]
      : filters.clinicIds.filter(id => id !== clinicId);
    
    onFiltersChange({ ...filters, clinicIds: newClinicIds });
  };

  const handleSelectAll = () => {
    const allSelected = filters.clinicIds.length === clinics.length;
    const newClinicIds = allSelected ? [] : clinics.map(clinic => clinic.id);
    onFiltersChange({ ...filters, clinicIds: newClinicIds });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-theme-dark-card border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm font-medium">Select Clinics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={filters.clinicIds.length === clinics.length && clinics.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all" className="text-sm text-gray-300">
              Select All
            </Label>
          </div>
          <div className="max-h-32 overflow-y-auto space-y-2">
            {clinics.map((clinic) => (
              <div key={clinic.id} className="flex items-center space-x-2">
                <Checkbox
                  id={clinic.id}
                  checked={filters.clinicIds.includes(clinic.id)}
                  onCheckedChange={(checked) => handleClinicToggle(clinic.id, checked as boolean)}
                />
                <Label htmlFor={clinic.id} className="text-sm text-gray-300">
                  {clinic.name}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-theme-dark-card border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm font-medium">Month</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={filters.month} onValueChange={(value) => onFiltersChange({ ...filters, month: value })}>
            <SelectTrigger className="bg-theme-dark-lighter border-gray-700 text-white">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent className="bg-theme-dark-lighter border-gray-700">
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value} className="text-white hover:bg-theme-blue/20">
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="bg-theme-dark-card border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm font-medium">Year</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={filters.year} onValueChange={(value) => onFiltersChange({ ...filters, year: value })}>
            <SelectTrigger className="bg-theme-dark-lighter border-gray-700 text-white">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent className="bg-theme-dark-lighter border-gray-700">
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
  );
}
