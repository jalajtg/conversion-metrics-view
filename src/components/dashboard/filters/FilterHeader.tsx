
import React from 'react';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FilterHeaderProps {
  onClearAll: () => void;
  onApply: () => void;
  hasPendingChanges: boolean;
}

export function FilterHeader({ onClearAll, onApply, hasPendingChanges }: FilterHeaderProps) {
  return (
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-white text-lg font-semibold">Filters</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Clear All
          </Button>
          <Button
            onClick={onApply}
            disabled={!hasPendingChanges}
            className="text-sm bg-theme-blue hover:bg-theme-blue/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </CardHeader>
  );
}
