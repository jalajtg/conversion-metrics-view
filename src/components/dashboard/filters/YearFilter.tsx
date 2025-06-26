
import React, { useState, useEffect, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { useDebounce } from '@/hooks/useDebounce';

interface YearFilterProps {
  year: number;
  onYearChange: (year: number) => void;
}

export function YearFilter({ year, onYearChange }: YearFilterProps) {
  const [localYear, setLocalYear] = useState(year.toString());
  const debouncedYear = useDebounce(localYear, 500);

  useEffect(() => {
    const yearNum = parseInt(debouncedYear);
    if (!isNaN(yearNum) && yearNum >= 2020 && yearNum <= 2025 && yearNum !== year) {
      onYearChange(yearNum);
    }
  }, [debouncedYear, year, onYearChange]);

  const handleYearChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalYear(value);
  }, []);

  // Update local year when prop changes
  useEffect(() => {
    setLocalYear(year.toString());
  }, [year]);

  return (
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
  );
}
