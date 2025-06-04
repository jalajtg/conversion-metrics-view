

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
    console.log('New user created with ID:', newUserId);
    onUserSelect(newUserId);
    setShowCreateDialog(false);
  };

  const handleUserSelect = (userId: string) => {
    console.log('User selected in UserSelector:', userId);
    onUserSelect(userId);
  };

  const selectedUser = users.find(user => user.id === selectedUserId);
  console.log('Selected user ID:', selectedUserId);
  console.log('Found selected user:', selectedUser);

  if (isLoading) {
    return <div className="text-gray-400">Loading users...</div>;
  }

  return (
    <div className="space-y-2">
      <Select value={selectedUserId} onValueChange={handleUserSelect}>
        <SelectTrigger className="bg-theme-dark-lighter border-gray-600 text-white">
          <SelectValue placeholder="Select a user">
            {selectedUser ? (
              <span className="text-white">{selectedUser.name || 'Unnamed User'}</span>
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
              <span>{user.id || 'Unnamed User'}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* 
      <Button
        type="button"
        variant="outline"
        onClick={() => setShowCreateDialog(true)}
        className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create New User
      </Button> */}

      {/* <CreateUserDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
        onUserCreated={handleUserCreated} 
      /> */}
    </div>
  );
}

