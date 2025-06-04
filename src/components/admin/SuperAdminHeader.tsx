
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { User } from 'lucide-react';

export function SuperAdminHeader() {
  const { user, profile } = useAuth();
  
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-theme-dark-lighter">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center gap-4 flex-1">
          <SidebarTrigger className="md:hidden text-theme-blue hover:bg-theme-dark-card" />
          <h1 className="text-lg md:text-xl font-semibold text-white">Super Admin Panel</h1>
        </div>
        
        {user && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-theme-blue/20 flex items-center justify-center">
                <User className="h-4 w-4 text-theme-blue" />
              </div>
              <span className="hidden sm:block text-white font-medium text-sm">
                {profile?.name || user.email}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
