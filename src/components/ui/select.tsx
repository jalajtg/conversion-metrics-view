
import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

interface SelectTriggerProps {
  className?: string;
  children: React.ReactNode;
}

interface SelectContentProps {
  className?: string;
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

interface SelectValueProps {
  placeholder?: string;
  children?: React.ReactNode;
}

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({
  isOpen: false,
  setIsOpen: () => {},
});

export function Select({ value, onValueChange, children }: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen, setIsOpen } = React.useContext(SelectContext);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setIsOpen]);

    return (
      <div ref={dropdownRef}>
        <button
          ref={ref}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        >
          {children}
          <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform ml-2 flex-shrink-0", isOpen && "rotate-180")} />
        </button>
      </div>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

export function SelectContent({ className, children }: SelectContentProps) {
  const { isOpen } = React.useContext(SelectContext);

  if (!isOpen) return null;

  return (
    <div className={cn(
      "absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg max-h-96 overflow-y-auto z-50",
      className
    )}>
      <div className="p-1">
        {children}
      </div>
    </div>
  );
}

export function SelectItem({ value, className, children }: SelectItemProps) {
  const { value: selectedValue, onValueChange, setIsOpen } = React.useContext(SelectContext);
  const isSelected = selectedValue === value;

  const handleClick = () => {
    console.log('SelectItem clicked, value:', value);
    if (onValueChange) {
      onValueChange(value);
    }
    setIsOpen(false);
  };

  return (
    <div
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
        isSelected && "bg-accent text-accent-foreground",
        className
      )}
      onClick={handleClick}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4 text-white" />}
      </span>
      {children}
    </div>
  );
}

export function SelectValue({ placeholder, children }: SelectValueProps) {
  const { value } = React.useContext(SelectContext);

  // If children are provided (custom content), use them directly
  if (children) {
    return <div className="flex-1 text-left truncate">{children}</div>;
  }

  // Otherwise, show the value or placeholder
  return (
    <span className="truncate">
      {value || <span className="text-muted-foreground">{placeholder}</span>}
    </span>
  );
}

// Keep these exports for compatibility
export const SelectGroup = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const SelectLabel = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)} {...props} />
);
export const SelectSeparator = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
);
export const SelectScrollUpButton = () => null;
export const SelectScrollDownButton = () => null;
