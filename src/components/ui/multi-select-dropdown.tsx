
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
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between bg-theme-dark-lighter border-gray-700 text-white hover:bg-theme-dark-lighter/80",
            className
          )}
        >
          <div className="flex flex-wrap gap-1 max-w-full">
            {selectedValues.length === 0 ? (
              <span className="text-gray-400">{placeholder}</span>
            ) : selectedValues.length <= 2 ? (
              selectedOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="bg-theme-blue/20 text-theme-blue border-theme-blue/30 text-xs"
                >
                  {option.label}
                  <button
                    className="ml-1 hover:bg-theme-blue/30 rounded-full p-0.5"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelect(option.value, false);
                    }}
                  >
                    <X className="h-2 w-2" />
                  </button>
                </Badge>
              ))
            ) : (
              <Badge
                variant="secondary"
                className="bg-theme-blue/20 text-theme-blue border-theme-blue/30 text-xs"
              >
                {selectedValues.length} selected
              </Badge>
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-full min-w-[200px] bg-theme-dark-lighter border-gray-700 max-h-64 overflow-y-auto"
        align="start"
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
                className="text-xs text-gray-400 hover:text-white"
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
  );
}
