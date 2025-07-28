
import * as React from "react";
import { Check, ChevronDown, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

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
  showChips?: boolean;
}

export function MultiSelectDropdown({
  options,
  selectedValues,
  onSelectionChange,
  placeholder = "Select items...",
  className,
  showChips = true,
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log("Clear All clicked - current selectedValues:", selectedValues);
    onSelectionChange([]);
    console.log("Clear All clicked - selection cleared, calling onSelectionChange with empty array");
  };

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value)
  );

  // Clear search when dropdown closes
  React.useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);
  return (
    <div className={cn("w-full relative", className)} ref={dropdownRef}>
      <Button
        ref={triggerRef}
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between bg-theme-dark-lighter border-gray-700 text-white hover:bg-theme-dark-lighter/80 min-h-[40px] rounded-md border-2 focus:border-gray-600"
      >
        <span className="text-left truncate">
          {selectedValues.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            <span className="text-white">
              {selectedValues.length} selected
            </span>
          )}
        </span>
        <ChevronDown className={cn("h-4 w-4 opacity-50 shrink-0 ml-2 transition-transform", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-theme-dark-lighter border-2 border-gray-700 rounded-md shadow-lg max-h-64 overflow-hidden z-50">
          <div className="p-2">
            {/* Search Input */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search clinics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-theme-dark border-gray-600 text-white placeholder-gray-400 focus:border-theme-blue rounded-md"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            <div className="max-h-48 overflow-y-auto">
              <div className="flex items-center justify-between px-3 py-2 text-white hover:bg-theme-blue/20 rounded">
                <div 
                  className="flex items-center cursor-pointer flex-1"
                  onClick={handleSelectAll}
                >
                  <div className="w-4 h-4 border border-gray-400 rounded flex items-center justify-center mr-2">
                    {selectedValues.length === options.length && options.length > 0 && (
                      <Check className="h-3 w-3 text-theme-blue" />
                    )}
                  </div>
                  <span>Select All</span>
                </div>
                {selectedValues.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="text-xs text-gray-400 hover:text-white px-2 py-1 h-auto bg-red-500/20 hover:bg-red-500/30 transition-colors ml-2"
                    type="button"
                  >
                    Clear All
                  </Button>
                )}
              </div>
              
              {filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center px-3 py-2 text-white hover:bg-theme-blue/20 rounded cursor-pointer"
                  onClick={() => handleSelect(option.value, !selectedValues.includes(option.value))}
                >
                  <div className="w-4 h-4 border border-gray-400 rounded flex items-center justify-center mr-2">
                    {selectedValues.includes(option.value) && (
                      <Check className="h-3 w-3 text-theme-blue" />
                    )}
                  </div>
                  <span>{option.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Selected chips displayed below the input - only show if showChips is true */}
      {showChips && selectedValues.length > 0 && (
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
