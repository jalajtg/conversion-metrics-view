
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  
  return (
    <header className="border-b border-gray-800 bg-theme-dark-lighter sticky top-0 z-30 flex h-16 items-center">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-4">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-theme-dark-card border-gray-700 hover:bg-theme-dark hover:border-theme-blue text-white"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-theme-blue/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-theme-blue" />
                    </div>
                    <span className="hidden sm:inline">{profile?.name || user.email}</span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="right" 
                className="w-56 bg-theme-dark-lighter border-gray-700 text-white z-50"
                sideOffset={5}
              >
                <DropdownMenuLabel className="text-white font-medium">
                  {profile?.name || user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem 
                  onClick={() => navigate('/dashboard')} 
                  className="text-white hover:bg-theme-dark-card hover:text-theme-blue cursor-pointer focus:bg-theme-dark-card focus:text-theme-blue"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem 
                  onClick={() => signOut()} 
                  className="text-white hover:bg-theme-dark-card hover:text-red-400 cursor-pointer focus:bg-theme-dark-card focus:text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}
