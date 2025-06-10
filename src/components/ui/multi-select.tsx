
import React, { useState, useRef, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Check, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selectedValues,
  onSelectionChange,
  placeholder = "Select options...",
  className
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSelectAll = () => {
    onSelectionChange(options.map(option => option.value));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const handleToggleOption = (value: string) => {
    const newSelection = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onSelectionChange(newSelection);
  };

  const selectedCount = selectedValues.length;
  const displayText = selectedCount === 0 
    ? placeholder 
    : selectedCount === 1 
      ? options.find(opt => opt.value === selectedValues[0])?.label || `${selectedCount} selected`
      : `${selectedCount} selected`;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-theme-dark-lighter border-gray-600 text-white hover:bg-gray-700",
            className
          )}
        >
          <span className="truncate">{displayText}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content 
          className="w-[var(--radix-popover-trigger-width)] bg-theme-dark-card border border-gray-600 rounded-md shadow-lg z-50"
          side="bottom"
          align="start"
          sideOffset={4}
        >
          <div className="p-2 space-y-2">
            {/* Search Input */}
            <Input
              placeholder="Search categories..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="h-8 bg-theme-dark-lighter border-gray-600 text-white placeholder-gray-400"
            />
            
            {/* Select All / Clear All */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="flex-1 h-8 text-xs text-gray-300 hover:bg-gray-700"
              >
                Select All
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="flex-1 h-8 text-xs text-gray-300 hover:bg-gray-700"
              >
                Clear All
              </Button>
            </div>
            
            {/* Options List */}
            <div className="max-h-60 overflow-auto">
              {filteredOptions.length === 0 ? (
                <div className="py-2 text-sm text-gray-400 text-center">
                  No categories found
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = selectedValues.includes(option.value);
                  return (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-700"
                      onClick={() => handleToggleOption(option.value)}
                    >
                      <div className="flex h-4 w-4 items-center justify-center">
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className="text-white">{option.label}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
