
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { UserRoleBadge } from './UserRoleBadge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  status: 'active' | 'inactive';
}

interface UserManagementTableProps {
  users: UserProfile[];
  onEdit: (user: UserProfile) => void;
  onDelete: (userId: string) => void;
}

export function UserManagementTable({
  users,
  onEdit,
  onDelete
}: UserManagementTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  const handleDeleteClick = (user: UserProfile) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      onDelete(userToDelete.id);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700">
              <TableHead className="text-gray-400 w-1/3">Name</TableHead>
              <TableHead className="text-gray-400 w-1/3">Email</TableHead>
              <TableHead className="text-gray-400 w-1/6">Role</TableHead>
              <TableHead className="text-gray-400 w-1/6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id} className="border-gray-800">
                <TableCell className="text-white font-medium w-1/3">
                  {user.name || 'No name'}
                </TableCell>
                <TableCell className="text-gray-300 w-1/3">{user.email}</TableCell>
                <TableCell className="w-1/6">
                  <UserRoleBadge role={user.role} />
                </TableCell>
                <TableCell className="w-1/6">
                  <div className="flex items-center gap-2">
                    {/* <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(user)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button> */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(user)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-theme-dark-card border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Confirm User Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure that you want to delete the user{' '}
              <span className="font-semibold text-white">
                {userToDelete?.name || userToDelete?.email}
              </span>
              ? This action cannot be undone and will remove the user from both 
              the profile and authentication data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={handleCancelDelete}
              className="bg-gray-600 hover:bg-gray-700 text-white border-gray-600"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
