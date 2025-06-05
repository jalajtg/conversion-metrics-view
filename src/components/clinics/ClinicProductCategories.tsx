
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

export function ClinicProductCategories({ clinicId, clinicName }: ClinicProductCategoriesProps) {
  const { data: clinicCategories, isLoading } = useClinicProductCategories(clinicId);
  const { data: allCategories } = useProductCategories();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
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
    if (!selectedCategoryId || !price) return;
    
    createMutation.mutate({
      clinic_id: clinicId,
      product_category_id: selectedCategoryId,
      price: parseFloat(price),
    });
  };

  const handleUpdatePrice = (categoryId: string, newPrice: string) => {
    updateMutation.mutate({
      id: categoryId,
      updates: { price: parseFloat(newPrice) },
    });
  };

  const availableCategories = allCategories?.filter(
    category => !clinicCategories?.some(cc => cc.product_category_id === category.id)
  ) || [];

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
                      {availableCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id} className="text-white hover:bg-theme-dark-lighter">
                          {category.name}
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
                  disabled={!selectedCategoryId || !price || createMutation.isPending}
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
        {clinicCategories && clinicCategories.length > 0 ? (
          <div className="space-y-4">
            {clinicCategories.map((clinicCategory) => (
              <div key={clinicCategory.id} className="flex items-center justify-between p-4 bg-theme-dark-lighter rounded-lg border border-gray-600">
                <div className="flex-1">
                  <h3 className="text-white font-medium">{clinicCategory.product_category?.name}</h3>
                  <p className="text-gray-400 text-sm">{clinicCategory.product_category?.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  {editingCategory === clinicCategory.id ? (
                    <div className="flex items-center gap-2">
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
                    </div>
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
              </div>
            ))}
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
