
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ChevronDown, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ProductCategoryManager, ProductCategoryWithPrice } from './ProductCategoryManager';
import { useUserRole } from '@/hooks/useUserRole';

interface ClinicFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  owner_id: string;
  productCategories: ProductCategoryWithPrice[];
  total_paid?: number;
}

interface ClinicFormProps {
  formData: ClinicFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onUserSelect: (userId: string) => void;
  onProductCategoriesChange: (categories: ProductCategoryWithPrice[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isEdit?: boolean;
}

interface User {
  id: string;
  name: string | null;
}

export function ClinicForm({
  formData,
  onInputChange,
  onUserSelect,
  onProductCategoriesChange,
  onSubmit,
  onCancel,
  isSubmitting,
  isEdit = false
}: ClinicFormProps) {
  const { isSuperAdmin } = useUserRole();
  
  const {
    data: users = [],
    isLoading: isLoadingUsers
  } = useQuery({
    queryKey: ['users-for-clinic'],
    queryFn: async () => {
      console.log('Fetching users from profiles table...');

      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .order('name');
      
      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }
      
      console.log('Users fetched:', data);
      return data as User[];
    }
  });

  const selectedUser = users.find(user => user.id === formData.owner_id);

  // Validation state
  const hasNameError = !formData.name.trim();
  const hasOwnerError = !formData.owner_id;
  const hasValidationErrors = hasNameError || hasOwnerError;

  console.log('ClinicForm render - formData:', formData);

  return (
    <Card className="bg-theme-dark-card border-gray-700">
      <CardHeader className="border-b border-gray-700">
        <CardTitle className="text-white text-xl">
          Clinic Information
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Validation Errors Alert */}
          {hasValidationErrors && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fill in all required fields before submitting.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className={`text-gray-300 ${hasNameError ? 'text-red-400' : ''}`}>
                Clinic Name *
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={onInputChange}
                placeholder="Enter clinic name"
                required
                className={`bg-theme-dark-lighter border-gray-600 text-white placeholder-gray-400 focus:border-theme-blue focus:ring-theme-blue ${
                  hasNameError ? 'border-red-500 focus:border-red-500' : ''
                }`}
              />
              {hasNameError && (
                <p className="text-red-400 text-sm">Clinic name is required</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={onInputChange}
                placeholder="Enter clinic email"
                className="bg-theme-dark-lighter border-gray-600 text-white placeholder-gray-400 focus:border-theme-blue focus:ring-theme-blue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-300">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={onInputChange}
                placeholder="Enter clinic phone"
                className="bg-theme-dark-lighter border-gray-600 text-white placeholder-gray-400 focus:border-theme-blue focus:ring-theme-blue"
              />
            </div>

            <div className="space-y-2">
              <Label className={`text-gray-300 ${hasOwnerError ? 'text-red-400' : ''}`}>
                Clinic Owner *
              </Label>
              {isLoadingUsers ? (
                <div className="text-gray-400">Loading users...</div>
              ) : (
                <div className="relative">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <Button 
                        variant="outline" 
                        className={`w-full bg-theme-dark-lighter border-gray-600 text-white justify-between ${
                          hasOwnerError ? 'border-red-500' : ''
                        }`}
                      >
                        <span className="truncate">
                          {selectedUser?.name || 'Select a user'}
                        </span>
                        <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                      </Button>
                    </DropdownMenu.Trigger>
                    
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content 
                        className="relative z-50 min-w-[200px] bg-theme-dark-card rounded-md border border-gray-700 shadow-md"
                        side="bottom"
                        align="start"
                        sideOffset={4}
                        alignOffset={0}
                      >
                        <div className="max-h-[300px] overflow-y-auto py-1">
                          {users.map(user => (
                            <DropdownMenu.Item
                              key={user.id}
                              className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-theme-dark-lighter focus:bg-theme-dark-lighter text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                              onSelect={() => onUserSelect(user.id)}
                            >
                              {user.name || 'Unnamed User'}
                            </DropdownMenu.Item>
                          ))}
                        </div>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
              )}
              {hasOwnerError && (
                <p className="text-red-400 text-sm">Clinic owner must be selected</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-gray-300">
              Address
            </Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={onInputChange}
              placeholder="Enter clinic address"
              rows={3}
              className="bg-theme-dark-lighter border-gray-600 text-white placeholder-gray-400 focus:border-theme-blue focus:ring-theme-blue resize-none"
            />
          </div>

          <ProductCategoryManager
            selectedCategories={formData.productCategories}
            onSelectionChange={onProductCategoriesChange}
            className="space-y-4"
          />

          {/* Total Paid - Only for Super Admin */}
          {isSuperAdmin && (
            <div className="space-y-2">
              <Label htmlFor="total_paid" className="text-gray-300">
                Total Paid Amount ($)
              </Label>
              <Input
                id="total_paid"
                name="total_paid"
                type="number"
                step="0.01"
                min="0"
                value={formData.total_paid || ''}
                onChange={onInputChange}
                placeholder="Enter total paid amount"
                className="bg-theme-dark-lighter border-gray-600 text-white placeholder-gray-400 focus:border-theme-blue focus:ring-theme-blue"
              />
            </div>
          )}

          <div className="flex justify-end gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || hasValidationErrors}
              className="bg-theme-blue hover:bg-theme-blue/90 text-white disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEdit ? 'Update Clinic' : 'Create Clinic'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
