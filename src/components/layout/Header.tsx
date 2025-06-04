
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { User } from 'lucide-react';

export function Header() {
  const { user, profile } = useAuth();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-theme-dark-lighter">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-4 flex-1">
          <SidebarTrigger className="lg:hidden text-theme-blue hover:bg-theme-dark-card" />
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/bfb01530-83c3-492e-9590-62372077dda7.png" 
              alt="Logo" 
              className="h-8 md:h-10" 
            />
          </div>
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
