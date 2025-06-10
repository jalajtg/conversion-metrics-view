
import React from 'react';
import { useProductCategories } from '@/hooks/useProductCategories';
import { MultiSelect } from '@/components/ui/multi-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ProductCategoryWithPrice {
  product_category_id: string;
  price: number;
}

interface ProductCategoryManagerProps {
  selectedCategories: ProductCategoryWithPrice[];
  onSelectionChange: (categories: ProductCategoryWithPrice[]) => void;
  className?: string;
}

export function ProductCategoryManager({
  selectedCategories,
  onSelectionChange,
  className
}: ProductCategoryManagerProps) {
  const { data: productCategories = [], isLoading } = useProductCategories();

  const selectedCategoryIds = selectedCategories.map(cat => cat.product_category_id);

  const handleCategorySelection = (categoryIds: string[]) => {
    console.log('ProductCategoryManager: Category selection changed:', categoryIds);
    
    // Create new categories array based on selection
    const updatedCategories = categoryIds.map(categoryId => {
      const existing = selectedCategories.find(cat => cat.product_category_id === categoryId);
      return existing || { product_category_id: categoryId, price: 0 };
    });
    
    console.log('ProductCategoryManager: Updated categories:', updatedCategories);
    onSelectionChange(updatedCategories);
  };

  const handlePriceChange = (categoryId: string, price: string) => {
    const numPrice = parseFloat(price) || 0;
    console.log('ProductCategoryManager: Price changed for category:', categoryId, 'new price:', numPrice);
    
    const updatedCategories = selectedCategories.map(cat =>
      cat.product_category_id === categoryId
        ? { ...cat, price: numPrice }
        : cat
    );
    
    console.log('ProductCategoryManager: Updated categories after price change:', updatedCategories);
    onSelectionChange(updatedCategories);
  };

  const removeCategory = (categoryId: string) => {
    console.log('ProductCategoryManager: Removing category:', categoryId);
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
        <Label className="text-gray-300">Product Categories & Pricing</Label>
        <p className="text-sm text-gray-400">
          Select product categories and set prices. Changes will be saved when you click "Create Clinic" or "Update Clinic".
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
          <Label className="text-gray-300 text-sm">Set Prices for Selected Categories</Label>
          {selectedCategories.map(({ product_category_id, price }) => {
            const category = productCategories.find(cat => cat.id === product_category_id);
            return (
              <Card key={product_category_id} className="bg-theme-dark-lighter border-gray-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-medium">{category?.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCategory(product_category_id)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/20"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      {category?.description && (
                        <p className="text-gray-400 text-sm mt-1">{category.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`price-${product_category_id}`} className="text-gray-300 text-sm">
                        Price:
                      </Label>
                      <Input
                        id={`price-${product_category_id}`}
                        type="number"
                        value={price || ''}
                        onChange={(e) => handlePriceChange(product_category_id, e.target.value)}
                        placeholder="0.00"
                        className="w-24 bg-theme-dark-lighter border-gray-600 text-white"
                        min="0"
                        step="0.01"
                      />
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
