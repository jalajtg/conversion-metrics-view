
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserFormData {
  name: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  status: 'active' | 'inactive';
}

interface UserFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  formData: UserFormData;
  onFormDataChange: (data: UserFormData) => void;
  onSave: () => void;
  isEditMode?: boolean;
}

export function UserFormDialog({
  isOpen,
  onOpenChange,
  title,
  formData,
  onFormDataChange,
  onSave,
  isEditMode = false
}: UserFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-theme-dark-card border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-400">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
              className="bg-theme-dark border-gray-700 text-white"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-gray-400">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
              className="bg-theme-dark border-gray-700 text-white"
              disabled={isEditMode}
            />
          </div>
          <div>
            <Label htmlFor="role" className="text-gray-400">Role</Label>
            <Select value={formData.role} onValueChange={(value: any) => onFormDataChange({ ...formData, role: value })}>
              <SelectTrigger className="bg-theme-dark border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isEditMode && (
            <div>
              <Label htmlFor="status" className="text-gray-400">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => onFormDataChange({ ...formData, status: value })}>
                <SelectTrigger className="bg-theme-dark border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <Button onClick={onSave} className="w-full bg-theme-blue hover:bg-theme-blue/80">
            {isEditMode ? 'Save Changes' : 'Add User'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
