
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { createProduct } from '@/services/productService';
import { useClinics } from '@/hooks/useClinics';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  clinic_id: string;
}

export function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { data: clinics } = useClinics();
  const queryClient = useQueryClient();
  
  const form = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      clinic_id: '',
    },
  });

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-products"] });
      toast({
        title: "Success",
        description: "Product created successfully!",
      });
      form.reset();
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    createProductMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-theme-blue hover:bg-theme-blue/90 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-theme-dark-card border-theme-dark-lighter text-white max-w-lg mx-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold text-white">Add New Product</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Product name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-200">Product Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Enter product name"
                      className="bg-theme-dark-lighter border-theme-dark-lighter text-white placeholder:text-gray-400 focus:border-theme-blue focus:ring-theme-blue"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-200">Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Enter product description"
                      rows={3}
                      className="bg-theme-dark-lighter border-theme-dark-lighter text-white placeholder:text-gray-400 focus:border-theme-blue focus:ring-theme-blue resize-none"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="price"
              rules={{ 
                required: "Price is required",
                min: { value: 0, message: "Price must be positive" }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-200">Price ($)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="bg-theme-dark-lighter border-theme-dark-lighter text-white placeholder:text-gray-400 focus:border-theme-blue focus:ring-theme-blue"
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clinic_id"
              rules={{ required: "Please select a clinic" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-200">Clinic</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="bg-theme-dark-lighter border-theme-dark-lighter text-white focus:border-theme-blue focus:ring-theme-blue">
                        <SelectValue placeholder="Select a clinic" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-theme-dark-card border-theme-dark-lighter">
                      {clinics?.map((clinic) => (
                        <SelectItem 
                          key={clinic.id} 
                          value={clinic.id} 
                          className="text-white hover:bg-theme-dark-lighter focus:bg-theme-dark-lighter"
                        >
                          {clinic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-3 pt-6 border-t border-theme-dark-lighter">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="border-theme-dark-lighter text-gray-300 hover:bg-theme-dark-lighter hover:text-white"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createProductMutation.isPending}
                className="bg-theme-blue hover:bg-theme-blue/90 text-white disabled:opacity-50"
              >
                {createProductMutation.isPending ? "Creating..." : "Create Product"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
