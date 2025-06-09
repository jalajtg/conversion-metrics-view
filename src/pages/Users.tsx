
import React, { useEffect } from 'react';
import { UserManagement } from '@/components/admin/UserManagement';
import { useUserRole } from '@/hooks/useUserRole';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function Users() {
  const { isSuperAdmin, isLoading } = useUserRole();

  // Set page title
  useEffect(() => {
    document.title = 'Users | Dashboard Platform';
  }, []);

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
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          User Management
        </h1>
        <p className="text-gray-400">
          Manage all users in the system
        </p>
      </div>
      
      <UserManagement />
    </div>
  );
}
