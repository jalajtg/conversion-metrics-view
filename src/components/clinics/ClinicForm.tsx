
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserSelector } from './UserSelector';
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

export function ClinicForm({
  formData,
  onInputChange,
  onUserSelect,
  onSubmit,
  onCancel,
  isSubmitting
}: ClinicFormProps) {
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
              <UserSelector
                selectedUserId={formData.owner_id}
                onUserSelect={onUserSelect}
              />
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
