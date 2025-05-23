
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { LayoutDashboard, User, LogOut, HelpCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function AppSidebar() {
  const location = useLocation();
  const { signOut, profile } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <Sidebar className="bg-theme-dark-lighter border-r border-gray-800">
      <SidebarHeader>
        <div className="px-4 py-4 flex items-center gap-3">
          <img 
            src="/lovable-uploads/bfb01530-83c3-492e-9590-62372077dda7.png" 
            alt="Logo" 
            className="h-8" 
          />
          <h2 className="text-xl font-bold text-white">Tora Tech</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/dashboard')} className="hover:bg-theme-dark-card hover:text-theme-blue">
                  <Link to="/dashboard" className={isActive('/dashboard') ? "text-theme-blue" : "text-white"}>
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/profile')} className="hover:bg-theme-dark-card hover:text-theme-blue">
                  <Link to="/profile" className={isActive('/profile') ? "text-theme-blue" : "text-white"}>
                    <User />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/faq')} className="hover:bg-theme-dark-card hover:text-theme-blue">
                  <Link to="/faq" className={isActive('/faq') ? "text-theme-blue" : "text-white"}>
                    <HelpCircle />
                    <span>FAQ</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400">Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => signOut()} className="text-white hover:bg-red-500/10 hover:text-red-400">
                  <LogOut />
                  <span>Log out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
