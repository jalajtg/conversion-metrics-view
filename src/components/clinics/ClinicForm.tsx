
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

interface ClinicFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  owner_id: string;
}

interface ClinicFormProps {
  formData: ClinicFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onUserSelect: (userId: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

interface User {
  id: string;
  name: string | null;
}

export function ClinicForm({
  formData,
  onInputChange,
  onUserSelect,
  onSubmit,
  onCancel,
  isSubmitting
}: ClinicFormProps) {
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

  return (
    <Card className="bg-theme-dark-card border-gray-700">
      <CardHeader className="border-b border-gray-700">
        <CardTitle className="text-white text-xl">
          Clinic Information
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">
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
                className="bg-theme-dark-lighter border-gray-600 text-white placeholder-gray-400 focus:border-theme-blue focus:ring-theme-blue"
              />
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
              <Label className="text-gray-300">
                Clinic Owner *
              </Label>
              {isLoadingUsers ? (
                <div className="text-gray-400">Loading users...</div>
              ) : (
                <Select value={formData.owner_id} onValueChange={onUserSelect}>
                  <SelectTrigger className="bg-theme-dark-lighter border-gray-600 text-white">
                    <SelectValue placeholder="Select a user">
                      {selectedUser ? (
                        <span className="text-white">{selectedUser.name || 'Unnamed User'}</span>
                      ) : (
                        <span className="text-gray-400">Select a user</span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-theme-dark-card border-gray-700 z-50">
                    {users.map(user => (
                      <SelectItem 
                        key={user.id} 
                        value={user.id} 
                        className="text-white hover:bg-theme-dark-lighter focus:bg-theme-dark-lighter hover:text-white focus:text-white cursor-pointer"
                      >
                        <span className="text-white">{user.name || 'Unnamed User'}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              disabled={isSubmitting}
              className="bg-theme-blue hover:bg-theme-blue/90 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Clinic'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
