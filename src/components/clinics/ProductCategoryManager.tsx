import React from 'react';
import { useProductCategories } from '@/hooks/useProductCategories';
import { MultiSelect } from '@/components/ui/multi-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Monthly pricing entry for a product category (using month numbers to match DB)
export interface MonthlyPrice {
  month: number; // 1=January, 2=February, etc. (matches DB structure)
  price: number;
}

// Representation of a selected product category together with all of its monthly prices
export interface ProductCategoryWithPrice {
  product_category_id: string;
  prices: MonthlyPrice[];
}
interface ProductCategoryManagerProps {
  selectedCategories: ProductCategoryWithPrice[];
  onSelectionChange: (categories: ProductCategoryWithPrice[]) => void;
  className?: string;
}
const MONTHS = [{
  value: 1,
  label: 'January'
}, {
  value: 2,
  label: 'February'
}, {
  value: 3,
  label: 'March'
}, {
  value: 4,
  label: 'April'
}, {
  value: 5,
  label: 'May'
}, {
  value: 6,
  label: 'June'
}, {
  value: 7,
  label: 'July'
}, {
  value: 8,
  label: 'August'
}, {
  value: 9,
  label: 'September'
}, {
  value: 10,
  label: 'October'
}, {
  value: 11,
  label: 'November'
}, {
  value: 12,
  label: 'December'
}];
export function ProductCategoryManager({
  selectedCategories,
  onSelectionChange,
  className
}: ProductCategoryManagerProps) {
  const {
    data: productCategories = [],
    isLoading
  } = useProductCategories();

  // Helper list of unique selected product category ids (one per card)
  const selectedCategoryIds = React.useMemo(() => {
    return Array.from(new Set(selectedCategories.map(cat => cat.product_category_id)));
  }, [selectedCategories]);
  const handleCategorySelection = (categoryIds: string[]) => {
    console.log('ProductCategoryManager: Category selection changed:', categoryIds);

    // 1. Keep only categories that are still selected
    let updatedCategories = selectedCategories.filter(cat => categoryIds.includes(cat.product_category_id));

    // 2. For newly added categories create an empty price array
    const newlyAddedIds = categoryIds.filter(id => !updatedCategories.some(cat => cat.product_category_id === id));
    const newlyAddedCategories: ProductCategoryWithPrice[] = newlyAddedIds.map(id => ({
      product_category_id: id,
      prices: []
    }));
    updatedCategories = [...updatedCategories, ...newlyAddedCategories];
    console.log('ProductCategoryManager: Updated categories after category selection:', updatedCategories);
    onSelectionChange(updatedCategories);
  };
  const handlePriceChange = (categoryId: string, month: number, price: string) => {
    const numPrice = parseFloat(price) || 0;
    console.log('ProductCategoryManager: Price changed for category:', categoryId, 'month:', month, 'new price:', numPrice);
    const updatedCategories = selectedCategories.map(cat => {
      if (cat.product_category_id !== categoryId) return cat;
      const updatedPrices = cat.prices.map(mp => mp.month === month ? {
        ...mp,
        price: numPrice
      } : mp);
      return {
        ...cat,
        prices: updatedPrices
      };
    });
    console.log('ProductCategoryManager: Updated categories after price change:', updatedCategories);
    onSelectionChange(updatedCategories);
  };
  const addMonthToCategory = (categoryId: string, month: number) => {
    console.log('ProductCategoryManager: Adding month to category:', categoryId, month);
    const updatedCategories = selectedCategories.map(cat => {
      if (cat.product_category_id !== categoryId) return cat;

      // Prevent duplicates (should already be prevented by UI)
      if (cat.prices.some(mp => mp.month === month)) return cat;
      return {
        ...cat,
        prices: [...cat.prices, {
          month,
          price: 0
        }]
      };
    });
    onSelectionChange(updatedCategories);
  };
  const removeMonthFromCategory = (categoryId: string, month: number) => {
    console.log('ProductCategoryManager: Removing month:', month, 'from category:', categoryId);
    const updatedCategories = selectedCategories.map(cat => {
      if (cat.product_category_id !== categoryId) return cat;
      return {
        ...cat,
        prices: cat.prices.filter(mp => mp.month !== month)
      };
    });
    onSelectionChange(updatedCategories);
  };
  const removeCategory = (categoryId: string) => {
    console.log('ProductCategoryManager: Removing category:', categoryId);
    const updatedCategoryIds = selectedCategoryIds.filter(id => id !== categoryId);
    handleCategorySelection(updatedCategoryIds);
  };
  const getMonthLabel = (monthNumber: number) => {
    const month = MONTHS.find(m => m.value === monthNumber);
    return month ? month.label : `Month ${monthNumber}`;
  };
  const categoryOptions = productCategories.map(category => ({
    value: category.id,
    label: category.name
  }));
  if (isLoading) {
    return <div className="text-gray-400">Loading product categories...</div>;
  }
  console.log('ProductCategoryManager: Current state - selectedCategories:', selectedCategories, 'selectedCategoryIds:', selectedCategoryIds);
  return <div className={className}>
      <div className="space-y-2">
        <Label className="text-gray-300">Product Categories & Monthly Pricing</Label>
        <p className="text-sm text-gray-400">
          Select product categories and set monthly prices. You can add multiple months for each category.
        </p>
        <MultiSelect options={categoryOptions} selectedValues={selectedCategoryIds} onSelectionChange={handleCategorySelection} placeholder="Select product categories..." className="w-full" />
      </div>
      
      {selectedCategories.length > 0 && <div className="mt-4 space-y-3">
          <Label className="text-gray-300 text-sm">Set Monthly Prices for Selected Categories</Label>
          {selectedCategoryIds.map(categoryId => {
        const category = productCategories.find(cat => cat.id === categoryId);
        // Find all month price entries for this category
        const categoryEntry = selectedCategories.find(cat => cat.product_category_id === categoryId);
        const monthPrices = categoryEntry?.prices || [];
        const usedMonths = monthPrices.map(mp => mp.month);
        const availableMonths = MONTHS.filter(m => !usedMonths.includes(m.value));
        return <Card key={categoryId} className="bg-theme-dark-lighter border-gray-600">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-medium">{category?.name}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeCategory(categoryId)} className="h-6 w-6 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/20">
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      {availableMonths.length > 0 && <Button type="button" variant="outline" size="sm" onClick={() => {
                  // Add the first available month
                  if (availableMonths.length > 0) {
                    addMonthToCategory(categoryId, availableMonths[0].value);
                  }
                }} disabled={availableMonths.length === 0} className="text-xs bg-theme-blue hover:bg-theme-blue/90 text-white border-theme-blue">
                          Add Month
                        </Button>}
                    </div>
                    
                    {category?.description && <p className="text-gray-400 text-sm">{category.description}</p>}
                    
                    <div className="space-y-2">
                      {monthPrices.map(({
                  month,
                  price
                }) => <div key={`${categoryId}-${month}`} className="flex items-center gap-3 p-2 bg-theme-dark rounded border border-gray-700">
                          <div className="flex-1">
                            <Label className="text-gray-300 text-xs">Month:</Label>
                            <select value={month} onChange={e => {
                      const newMonth = parseInt(e.target.value);
                      if (newMonth !== month && !usedMonths.includes(newMonth)) {
                        // Remove old month and add new month
                        removeMonthFromCategory(categoryId, month);
                        addMonthToCategory(categoryId, newMonth);
                      }
                    }} className="w-full px-2 py-1 bg-theme-dark-lighter border border-gray-600 rounded text-white text-sm">
                              {MONTHS.filter(m => m.value === month || !usedMonths.includes(m.value)).map(m => <option key={m.value} value={m.value} className="bg-theme-dark-card">
                                    {m.label}
                                  </option>)}
                            </select>
                          </div>
                          
                          
                          
                          {monthPrices.length > 1 && <Button type="button" variant="ghost" size="sm" onClick={() => removeMonthFromCategory(categoryId, month)} className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/20">
                              <X className="h-3 w-3" />
                            </Button>}
                        </div>)}
                    </div>
                  </div>
                </CardContent>
              </Card>;
      })}
        </div>}
    </div>;
}