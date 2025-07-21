import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { createProduct } from '@/services/productService';
import { useAllClinics } from '@/hooks/useAllClinics';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ProductFormData {
  name: string;
  description: string;
  clinic_id: string;
}

export function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { data: clinics } = useAllClinics();
  const queryClient = useQueryClient();

  const form = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      description: '',
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
      <DialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-theme-dark-card border-theme-dark-lighter text-white max-w-lg w-[90vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-4 sticky top-0 bg-theme-dark-card border-b border-theme-dark-lighter">
          <DialogTitle className="text-xl font-semibold text-white">Add New Product</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
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
              name="clinic_id"
              rules={{ required: "Please select a clinic" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-200">Clinic</FormLabel>
                  <FormControl>
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between bg-theme-dark-lighter border-theme-dark-lighter text-white",
                            !field.value && "text-gray-400"
                          )}
                        >
                          {field.value
                            ? clinics?.find((clinic) => clinic.id === field.value)?.name
                            : "Select a clinic"}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content
                          className="z-50 min-w-[200px] overflow-hidden rounded-md border border-gray-700 bg-theme-dark-card shadow-md"
                          align="start"
                          side="bottom"
                          sideOffset={4}
                        >
                          <div className="max-h-[200px] overflow-y-auto p-1">
                            {clinics?.map((clinic) => (
                              <DropdownMenu.Item
                                key={clinic.id}
                                className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-theme-dark-lighter focus:bg-theme-dark-lighter text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                onSelect={() => field.onChange(clinic.id)}
                              >
                                {clinic.name}
                              </DropdownMenu.Item>
                            ))}
                          </div>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
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

            <div className="flex justify-end space-x-3 pt-4 border-t border-theme-dark-lighter">
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
