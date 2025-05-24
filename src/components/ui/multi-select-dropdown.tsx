
import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectDropdownProps {
  options: MultiSelectOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelectDropdown({
  options,
  selectedValues,
  onSelectionChange,
  placeholder = "Select items...",
  className,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (value: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedValues, value]);
    } else {
      onSelectionChange(selectedValues.filter((v) => v !== value));
    }
  };

  const handleSelectAll = () => {
    const allSelected = selectedValues.length === options.length;
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(options.map((option) => option.value));
    }
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value)
  );

  return (
    <div className={cn("w-full", className)}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between bg-theme-dark-lighter border-gray-700 text-white hover:bg-theme-dark-lighter/80 min-h-[40px]"
          >
            <span className="text-left truncate">
              {selectedValues.length === 0 ? (
                <span className="text-gray-400">{placeholder}</span>
              ) : (
                <span className="text-white">
                  {selectedValues.length} clinic{selectedValues.length !== 1 ? 's' : ''} selected
                </span>
              )}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[var(--radix-dropdown-menu-trigger-width)] bg-theme-dark-lighter border-gray-700 max-h-64 overflow-y-auto"
          side="bottom"
          align="start"
          sideOffset={4}
          alignOffset={0}
          avoidCollisions={true}
        >
          <DropdownMenuCheckboxItem
            checked={selectedValues.length === options.length && options.length > 0}
            onCheckedChange={handleSelectAll}
            className="text-white hover:bg-theme-blue/20 focus:bg-theme-blue/20"
          >
            <div className="flex items-center justify-between w-full">
              <span>Select All</span>
              {selectedValues.length > 0 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleClearAll();
                  }}
                  className="text-xs text-gray-400 hover:text-white ml-2"
                >
                  Clear
                </button>
              )}
            </div>
          </DropdownMenuCheckboxItem>
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selectedValues.includes(option.value)}
              onCheckedChange={(checked) => handleSelect(option.value, checked)}
              className="text-white hover:bg-theme-blue/20 focus:bg-theme-blue/20"
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Selected chips displayed below the input */}
      {selectedValues.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <Badge
              key={option.value}
              variant="secondary"
              className="bg-theme-blue/20 text-theme-blue border-theme-blue/30 text-sm px-3 py-1 flex items-center gap-2 hover:bg-theme-blue/30 transition-colors"
            >
              <span className="max-w-[150px] sm:max-w-[200px] truncate">{option.label}</span>
              <button
                className="hover:bg-theme-blue/40 rounded-full p-0.5 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect(option.value, false);
                }}
                aria-label={`Remove ${option.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
