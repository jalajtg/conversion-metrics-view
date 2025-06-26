
import React, { useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown";
import { Clinic } from '@/types/dashboard';

interface ClinicFilterProps {
  clinics: Clinic[];
  selectedClinicIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onSelectAll: () => void;
}

export function ClinicFilter({ 
  clinics, 
  selectedClinicIds, 
  onSelectionChange, 
  onSelectAll 
}: ClinicFilterProps) {
  const clinicOptions = clinics.map(clinic => ({
    value: clinic.id,
    label: clinic.name
  }));

  const handleSelectionChange = useCallback((selectedIds: string[]) => {
    onSelectionChange(selectedIds);
  }, [onSelectionChange]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">Clinics</label>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSelectAll}
          className="text-xs text-gray-400 hover:text-white h-auto py-1 px-2"
        >
          Select All
        </Button>
      </div>
      <MultiSelectDropdown
        options={clinicOptions}
        selectedValues={selectedClinicIds}
        onSelectionChange={handleSelectionChange}
        placeholder="Select clinics..."
        className="w-full bg-theme-dark border-gray-700 text-white rounded"
        showChips={false}
      />
    </div>
  );
}
