
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User } from 'lucide-react';

export function SuperAdminHeader() {
  const { user, profile } = useAuth();
  
  return (
    <header className="fixed top-0 left-64 right-0 z-30 h-16 border-b border-gray-800 bg-theme-dark-lighter">
      <div className="flex h-full items-center justify-end px-6">
        {user && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-theme-blue/20 flex items-center justify-center">
              <User className="h-4 w-4 text-theme-blue" />
            </div>
            <span className="text-white font-medium text-sm">
              {profile?.name || user.email}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
