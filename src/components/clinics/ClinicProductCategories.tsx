
import React, { useState } from 'react';
import { useClinicProductCategories } from '@/hooks/useClinicProductCategories';
import { useProductCategories } from '@/hooks/useProductCategories';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  createClinicProductCategory, 
  updateClinicProductCategory, 
  deleteClinicProductCategory 
} from '@/services/clinicProductCategoryService';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Plus, Edit } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ClinicProductCategoriesProps {
  clinicId: string;
  clinicName: string;
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

export function ClinicProductCategories({ clinicId, clinicName }: ClinicProductCategoriesProps) {
  const { data: clinicCategories, isLoading } = useClinicProductCategories(clinicId);
  const { data: allCategories } = useProductCategories();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [price, setPrice] = useState<string>('');

  const createMutation = useMutation({
    mutationFn: createClinicProductCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic-product-categories"] });
      toast({
        title: "Success",
        description: "Product category added successfully!",
      });
      setIsAddDialogOpen(false);
      setSelectedCategoryId('');
      setSelectedMonth('');
      setPrice('');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add product category. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      updateClinicProductCategory(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic-product-categories"] });
      toast({
        title: "Success",
        description: "Price updated successfully!",
      });
      setEditingCategory(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update price. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClinicProductCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic-product-categories"] });
      toast({
        title: "Success",
        description: "Product category removed successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove product category. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAdd = () => {
    if (!selectedCategoryId || !selectedMonth || !price) return;
    
    createMutation.mutate({
      clinic_id: clinicId,
      product_category_id: selectedCategoryId,
      price: parseFloat(price),
      month: parseInt(selectedMonth),
    });
  };

  const handleUpdatePrice = (categoryId: string, newPrice: string) => {
    updateMutation.mutate({
      id: categoryId,
      updates: { price: parseFloat(newPrice) },
    });
  };

  // Get available categories and months for selection
  const getAvailableCategories = () => {
    return allCategories?.filter(
      category => !clinicCategories?.some(cc => cc.product_category_id === category.id)
    ) || [];
  };

  const getAvailableMonths = () => {
    if (!selectedCategoryId) return MONTHS;
    
    const usedMonths = clinicCategories?.filter(
      cc => cc.product_category_id === selectedCategoryId
    ).map(cc => cc.month) || [];
    
    return MONTHS.filter(month => !usedMonths.includes(month.value));
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Group categories by product category
  const groupedCategories = clinicCategories?.reduce((acc, category) => {
    const key = category.product_category_id;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(category);
    return acc;
  }, {} as Record<string, typeof clinicCategories>) || {};

  return (
    <Card className="w-full bg-theme-dark-card border-gray-700">
      <CardHeader className="border-b border-gray-700">
        <CardTitle className="text-white flex items-center justify-between">
          <span>Product Categories for {clinicName}</span>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-theme-blue text-theme-blue hover:bg-theme-blue/10">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-theme-dark-card border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Add Product Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Category</label>
                  <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                    <SelectTrigger className="bg-theme-dark-lighter border-gray-600 text-white">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-theme-dark-card border-gray-600">
                      {getAvailableCategories().map((category) => (
                        <SelectItem key={category.id} value={category.id} className="text-white hover:bg-theme-dark-lighter">
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Month</label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="bg-theme-dark-lighter border-gray-600 text-white">
                      <SelectValue placeholder="Select a month" />
                    </SelectTrigger>
                    <SelectContent className="bg-theme-dark-card border-gray-600">
                      {getAvailableMonths().map((month) => (
                        <SelectItem key={month.value} value={month.value.toString()} className="text-white hover:bg-theme-dark-lighter">
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Price</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter price"
                    className="bg-theme-dark-lighter border-gray-600 text-white"
                  />
                </div>
                <Button 
                  onClick={handleAdd}
                  disabled={!selectedCategoryId || !selectedMonth || !price || createMutation.isPending}
                  className="w-full bg-theme-blue hover:bg-theme-blue-light"
                >
                  {createMutation.isPending ? "Adding..." : "Add Category"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {Object.keys(groupedCategories).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedCategories).map(([categoryId, categories]) => {
              const productCategory = allCategories?.find(cat => cat.id === categoryId);
              return (
                <div key={categoryId} className="bg-theme-dark-lighter rounded-lg border border-gray-600 p-4">
                  <div className="mb-4">
                    <h3 className="text-white font-medium text-lg">{productCategory?.name}</h3>
                    {productCategory?.description && (
                      <p className="text-gray-400 text-sm">{productCategory.description}</p>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {categories.map((clinicCategory) => (
                      <div key={clinicCategory.id} className="flex items-center justify-between p-3 bg-theme-dark rounded border border-gray-700">
                        <div className="flex items-center gap-4">
                          <span className="text-gray-300 text-sm min-w-[80px]">
                            {MONTHS.find(m => m.value === clinicCategory.month)?.label}
                          </span>
                          {editingCategory === clinicCategory.id ? (
                            <Input
                              type="number"
                              step="0.01"
                              defaultValue={clinicCategory.price.toString()}
                              className="w-24 bg-theme-dark-card border-gray-600 text-white"
                              onBlur={(e) => {
                                handleUpdatePrice(clinicCategory.id, e.target.value);
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleUpdatePrice(clinicCategory.id, e.currentTarget.value);
                                }
                              }}
                              autoFocus
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">${Number(clinicCategory.price).toFixed(2)}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingCategory(clinicCategory.id)}
                                className="text-gray-400 hover:text-white"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(clinicCategory.id)}
                          disabled={deleteMutation.isPending}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <p>No product categories assigned to this clinic yet.</p>
            <p className="text-sm mt-2">Click "Add Category" to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
