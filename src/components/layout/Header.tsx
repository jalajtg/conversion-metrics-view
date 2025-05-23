
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
import { LogOut, Settings, User, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  
  return (
    <header className="border-b border-gray-800 bg-theme-dark sticky top-0 z-30 flex h-16 items-center">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="lg:hidden text-theme-blue hover:bg-theme-dark-lighter" />
          <h1 className="text-xl font-bold gradient-text">Sales Dashboard</h1>
        </div>
        
        {user && (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-theme-dark-lighter border-gray-700 hover:bg-theme-dark-card hover:border-theme-blue">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-theme-blue/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-theme-blue" />
                    </div>
                    <span className="hidden sm:inline text-gray-300">{profile?.name || user.email}</span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-theme-dark-lighter border border-gray-800">
                <DropdownMenuLabel className="text-gray-300">
                  {profile?.name || user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem onClick={() => navigate('/profile')} className="hover:bg-theme-dark hover:text-theme-blue cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')} className="hover:bg-theme-dark hover:text-theme-blue cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem onClick={() => signOut()} className="hover:bg-theme-dark hover:text-red-400 cursor-pointer">
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
