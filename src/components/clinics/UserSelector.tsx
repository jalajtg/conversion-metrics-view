
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateUserDialog } from './CreateUserDialog';

interface User {
  id: string;
  name: string | null;
}

interface UserSelectorProps {
  selectedUserId: string;
  onUserSelect: (userId: string) => void;
}

export function UserSelector({
  selectedUserId,
  onUserSelect
}: UserSelectorProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const {
    data: users = [],
    isLoading
  } = useQuery({
    queryKey: ['users-for-clinic'],
    queryFn: async () => {
      console.log('Fetching users from profiles table...');

      // Get all users from profiles table
      const {
        data,
        error
      } = await supabase.from('profiles').select('id, name').order('name');
      
      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }
      
      console.log('Users fetched:', data);
      return data as User[];
    }
  });

  const handleUserCreated = (newUserId: string) => {
    onUserSelect(newUserId);
    setShowCreateDialog(false);
  };

  const selectedUser = users.find(user => user.id === selectedUserId);

  if (isLoading) {
    return <div className="text-gray-400">Loading users...</div>;
  }

  return (
    <div className="space-y-2">
      <Select value={selectedUserId} onValueChange={onUserSelect}>
        <SelectTrigger className="bg-theme-dark-lighter border-gray-600 text-white">
          <SelectValue placeholder="Select a user">
            {selectedUser ? (
              <div className="flex flex-col">
                <span>{selectedUser.name || 'Unnamed User'}</span>
                <span className="text-sm text-gray-400">ID: {selectedUser.id.slice(0, 8)}...</span>
              </div>
            ) : (
              <span className="text-gray-400">Select a user</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-theme-dark-card border-gray-700">
          {users.map(user => (
            <SelectItem 
              key={user.id} 
              value={user.id} 
              className="text-white hover:bg-theme-dark-lighter focus:bg-theme-dark-lighter"
            >
              <div className="flex flex-col">
                <span>{user.name || 'Unnamed User'}</span>
                <span className="text-sm text-gray-400">ID: {user.id.slice(0, 8)}...</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button
        type="button"
        variant="outline"
        onClick={() => setShowCreateDialog(true)}
        className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create New User
      </Button>

      <CreateUserDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
        onUserCreated={handleUserCreated} 
      />
    </div>
  );
}
