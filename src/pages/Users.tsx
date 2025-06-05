
import React from 'react';
import { UserManagement } from '@/components/admin/UserManagement';
import { useUserRole } from '@/hooks/useUserRole';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function Users() {
  const { isSuperAdmin, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-theme-blue" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          User Management
        </h1>
        <p className="text-gray-400 text-sm">
          Manage all users in the system
        </p>
      </div>
      
      <UserManagement />
    </div>
  );
}
