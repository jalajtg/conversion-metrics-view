import React from 'react';
import { useProductCategories } from '@/hooks/useProductCategories';
import { MultiSelect } from '@/components/ui/multi-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface ProductCategoryWithPrice {
  product_category_id: string;
  price: number;
  month: number;
}

interface ProductCategoryManagerProps {
  selectedCategories: ProductCategoryWithPrice[];
  onSelectionChange: (categories: ProductCategoryWithPrice[]) => void;
  className?: string;
}

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' }
];

export function ProductCategoryManager({
  selectedCategories,
  onSelectionChange,
  className
}: ProductCategoryManagerProps) {
  const { data: productCategories = [], isLoading } = useProductCategories();

  const selectedCategoryIds = Array.from(new Set(selectedCategories.map(cat => cat.product_category_id)));

  const handleCategorySelection = (categoryIds: string[]) => {
    console.log('ProductCategoryManager: Category selection changed:', categoryIds);
    
    // Create new categories array based on selection
    const updatedCategories: ProductCategoryWithPrice[] = [];
    
    categoryIds.forEach(categoryId => {
      // Keep existing entries for this category
      const existingEntries = selectedCategories.filter(cat => cat.product_category_id === categoryId);
      
      if (existingEntries.length > 0) {
        updatedCategories.push(...existingEntries);
      } else {
        // Add new entry with default month (January) and price 0
        updatedCategories.push({
          product_category_id: categoryId,
          price: 0,
          month: 1
        });
      }
    });
    
    console.log('ProductCategoryManager: Updated categories:', updatedCategories);
    onSelectionChange(updatedCategories);
  };

  const handlePriceChange = (categoryId: string, month: number, price: string) => {
    const numPrice = parseFloat(price) || 0;
    console.log('ProductCategoryManager: Price changed for category:', categoryId, 'month:', month, 'new price:', numPrice);
    
    const updatedCategories = selectedCategories.map(cat =>
      cat.product_category_id === categoryId && cat.month === month
        ? { ...cat, price: numPrice }
        : cat
    );
    
    console.log('ProductCategoryManager: Updated categories after price change:', updatedCategories);
    onSelectionChange(updatedCategories);
  };

  const handleMonthChange = (categoryId: string, oldMonth: number, newMonth: number) => {
    console.log('ProductCategoryManager: Month changed for category:', categoryId, 'from:', oldMonth, 'to:', newMonth);
    
    // Check if this category already has an entry for the new month
    const existingEntry = selectedCategories.find(cat => 
      cat.product_category_id === categoryId && cat.month === newMonth
    );
    
    if (existingEntry) {
      console.log('Category already has entry for month', newMonth, ', skipping');
      return;
    }
    
    const updatedCategories = selectedCategories.map(cat =>
      cat.product_category_id === categoryId && cat.month === oldMonth
        ? { ...cat, month: newMonth }
        : cat
    );
    
    console.log('ProductCategoryManager: Updated categories after month change:', updatedCategories);
    onSelectionChange(updatedCategories);
  };

  const addMonthForCategory = (categoryId: string) => {
    console.log('ProductCategoryManager: Adding month for category:', categoryId);
    
    const existingMonths = selectedCategories
      .filter(cat => cat.product_category_id === categoryId)
      .map(cat => cat.month);
    
    // Find the next available month
    const availableMonth = MONTHS.find(month => !existingMonths.includes(month.value));
    
    if (!availableMonth) {
      console.log('All months already selected for this category');
      return;
    }
    
    const newEntry: ProductCategoryWithPrice = {
      product_category_id: categoryId,
      price: 0,
      month: availableMonth.value
    };
    
    const updatedCategories = [...selectedCategories, newEntry];
    console.log('ProductCategoryManager: Added new month entry:', updatedCategories);
    onSelectionChange(updatedCategories);
  };

  const removeCategory = (categoryId: string, month: number) => {
    console.log('ProductCategoryManager: Removing category:', categoryId, 'month:', month);
    const updatedCategories = selectedCategories.filter(cat => 
      !(cat.product_category_id === categoryId && cat.month === month)
    );
    onSelectionChange(updatedCategories);
  };

  const removeCategoryCompletely = (categoryId: string) => {
    console.log('ProductCategoryManager: Removing category completely:', categoryId);
    const updatedCategoryIds = selectedCategoryIds.filter(id => id !== categoryId);
    handleCategorySelection(updatedCategoryIds);
  };

  const categoryOptions = productCategories.map(category => ({
    value: category.id,
    label: category.name
  }));

  if (isLoading) {
    return <div className="text-gray-400">Loading product categories...</div>;
  }

  console.log('ProductCategoryManager: Current state - selectedCategories:', selectedCategories, 'selectedCategoryIds:', selectedCategoryIds);

  return (
    <div className={className}>
      <div className="space-y-2">
        <Label className="text-gray-300">Product Categories & Monthly Pricing</Label>
        <p className="text-sm text-gray-400">
          Select product categories and set monthly prices. You can add multiple months for each category.
        </p>
        <MultiSelect
          options={categoryOptions}
          selectedValues={selectedCategoryIds}
          onSelectionChange={handleCategorySelection}
          placeholder="Select product categories..."
          className="w-full"
        />
      </div>

      {selectedCategories.length > 0 && (
        <div className="mt-4 space-y-3">
          <Label className="text-gray-300 text-sm">Set Monthly Prices for Selected Categories</Label>
          {selectedCategoryIds.map(categoryId => {
            const category = productCategories.find(cat => cat.id === categoryId);
            const categoryEntries = selectedCategories.filter(cat => cat.product_category_id === categoryId);
            
            return (
              <Card key={categoryId} className="bg-theme-dark-lighter border-gray-600">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-medium">{category?.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCategoryCompletely(categoryId)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/20"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addMonthForCategory(categoryId)}
                        disabled={categoryEntries.length >= 12}
                        className="text-xs bg-theme-blue hover:bg-theme-blue/90 text-white border-theme-blue"
                      >
                        Add Month
                      </Button>
                    </div>
                    
                    {category?.description && (
                      <p className="text-gray-400 text-sm">{category.description}</p>
                    )}
                    
                    <div className="space-y-2">
                      {categoryEntries.map((entry, index) => (
                        <div key={`${categoryId}-${entry.month}`} className="flex items-center gap-3 p-2 bg-theme-dark rounded border border-gray-700">
                          <div className="flex-1">
                            <Label className="text-gray-300 text-xs">Month:</Label>
                            <Select
                              value={entry.month.toString()}
                              onValueChange={(value) => handleMonthChange(categoryId, entry.month, parseInt(value))}
                            >
                              <SelectTrigger className="w-full bg-theme-dark-lighter border-gray-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-theme-dark-card border-gray-600">
                                {MONTHS
                                  .filter(month => 
                                    month.value === entry.month || 
                                    !categoryEntries.some(e => e.month === month.value)
                                  )
                                  .map(month => (
                                    <SelectItem 
                                      key={month.value} 
                                      value={month.value.toString()}
                                      className="text-white hover:bg-theme-dark-lighter"
                                    >
                                      {month.label}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex-1">
                            <Label className="text-gray-300 text-xs">Price:</Label>
                            <Input
                              type="number"
                              value={entry.price || ''}
                              onChange={(e) => handlePriceChange(categoryId, entry.month, e.target.value)}
                              placeholder="0.00"
                              className="bg-theme-dark-lighter border-gray-600 text-white"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          
                          {categoryEntries.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCategory(categoryId, entry.month)}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/20"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
