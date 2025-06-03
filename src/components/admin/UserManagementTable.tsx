
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { UserRoleBadge } from './UserRoleBadge';
import { UserStatusBadge } from './UserStatusBadge';

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
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-700">
            <TableHead className="text-gray-400">Name</TableHead>
            <TableHead className="text-gray-400">Email</TableHead>
            <TableHead className="text-gray-400">Role</TableHead>
            <TableHead className="text-gray-400">Status</TableHead>
            <TableHead className="text-gray-400">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(user => (
            <TableRow key={user.id} className="border-gray-800">
              <TableCell className="text-white font-medium">
                {user.name || 'No name'}
              </TableCell>
              <TableCell className="text-gray-300">{user.email}</TableCell>
              <TableCell>
                <UserRoleBadge role={user.role} />
              </TableCell>
              <TableCell>
                <UserStatusBadge status={user.status} />
              </TableCell>
              <TableCell>
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
                    onClick={() => onDelete(user.id)}
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
  );
}
