import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { createClinic } from '@/services/clinicService';
import { useAuth } from '@/contexts/AuthContext';
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
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClinicFormData {
  name: string;
  address: string;
  phone: string;
}

export function AddClinicDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<ClinicFormData>({
    defaultValues: {
      name: '',
      address: '',
      phone: '',
    },
  });

  const createClinicMutation = useMutation({
    mutationFn: (data: ClinicFormData) => {
      return createClinic({
        ...data,
        email: user?.email || '',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-clinics"] });
      toast({
        title: "Success",
        description: "Clinic created successfully!",
      });
      form.reset();
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create clinic. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ClinicFormData) => {
    createClinicMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-theme-blue hover:bg-theme-blue/90 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Clinic
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-theme-dark-card border-gray-700 text-white max-w-md mx-auto fixed inset-0 flex items-center justify-center p-6 rounded-md"
        style={{ height: '400px', marginTop: "200px" }}
      >


        <div className="w-full">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Clinic</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Clinic name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Clinic Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter clinic name"
                        className="bg-theme-dark-lighter border-gray-600 text-white placeholder:text-gray-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                rules={{ required: "Address is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter clinic address"
                        className="bg-theme-dark-lighter border-gray-600 text-white placeholder:text-gray-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                rules={{ required: "Phone number is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter phone number"
                        className="bg-theme-dark-lighter border-gray-600 text-white placeholder:text-gray-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createClinicMutation.isPending}
                  className="bg-theme-blue hover:bg-theme-blue/90 text-white"
                >
                  {createClinicMutation.isPending ? "Creating..." : "Create Clinic"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
