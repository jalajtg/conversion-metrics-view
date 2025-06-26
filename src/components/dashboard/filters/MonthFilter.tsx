
import React, { useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown";

interface MonthFilterProps {
  selectedMonths: number[];
  year: number;
  onSelectionChange: (months: number[]) => void;
  onSelectAll: () => void;
}

export function MonthFilter({ 
  selectedMonths, 
  year, 
  onSelectionChange, 
  onSelectAll 
}: MonthFilterProps) {
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

  const availableMonths = useMemo(() => {
    return year === currentYear 
      ? months.filter(month => parseInt(month.value) <= currentMonth)
      : months;
  }, [year, currentYear, currentMonth, months]);

  const handleMonthSelectionChange = useCallback((selectedMonths: string[]) => {
    const numericMonths = selectedMonths.map(month => parseInt(month));
    onSelectionChange(numericMonths);
  }, [onSelectionChange]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">Months</label>
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
        options={availableMonths}
        selectedValues={selectedMonths.map(m => m.toString())}
        onSelectionChange={handleMonthSelectionChange}
        placeholder="Select months..."
        className="w-full bg-theme-dark border-gray-700 text-white rounded"
        showChips={false}
      />
    </div>
  );
}
