
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { User } from 'lucide-react';

export function SuperAdminHeader() {
  const { user, profile } = useAuth();
  
  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-50 h-16 border-b border-gray-800 bg-theme-dark-lighter">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden text-theme-blue hover:bg-theme-dark-card" />
          <h1 className="text-xl font-semibold text-white">Super Admin Panel</h1>
        </div>
        
        {user && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-theme-blue/20 flex items-center justify-center">
                <User className="h-4 w-4 text-theme-blue" />
              </div>
              <span className="text-white font-medium">{profile?.name || user.email}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
