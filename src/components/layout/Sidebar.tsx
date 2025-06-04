
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarHeader, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutDashboard, LogOut, HelpCircle, Calendar, MessageCircle, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

export function AppSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();
  const { isSuperAdmin } = useUserRole();
  
  const isActive = (path: string) => location.pathname === path;
  const isDashboard = location.pathname === '/dashboard';
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Sidebar className="fixed left-0 top-0 h-full w-64 border-r border-gray-800 bg-theme-dark-lighter z-40 hidden lg:flex">
      <SidebarHeader className="border-b border-gray-800 bg-theme-dark-lighter h-16">
        <div className="px-4 py-4 flex items-center gap-3">
          <img src="/lovable-uploads/bfb01530-83c3-492e-9590-62372077dda7.png" alt="Logo" className="h-8" />
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-theme-dark-lighter">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 px-4">Pages</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/dashboard')} className="hover:bg-theme-dark-card hover:text-theme-blue mx-2">
                  <Link to="/dashboard" className={isActive('/dashboard') ? "bg-theme-dark-card text-theme-blue" : "text-white"}>
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/faq')} className="hover:bg-theme-dark-card hover:text-theme-blue mx-2">
                  <Link to="/faq" className={isActive('/faq') ? "bg-theme-dark-card text-theme-blue" : "text-white"}>
                    <HelpCircle />
                    <span>FAQ</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {isSuperAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/super-admin')} className="hover:bg-theme-dark-card hover:text-theme-blue mx-2">
                    <Link to="/super-admin" className={isActive('/super-admin') ? "bg-theme-dark-card text-theme-blue" : "text-white"}>
                      <Shield />
                      <span>Super Admin</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isDashboard && !isSuperAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-400 px-4">Quick Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => scrollToSection('bookings-section')} className="text-white hover:bg-theme-dark-card hover:text-theme-blue cursor-pointer mx-2">
                    <Calendar />
                    <span>Bookings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => scrollToSection('faq-section')} className="text-white hover:bg-theme-dark-card hover:text-theme-blue cursor-pointer mx-2">
                    <MessageCircle />
                    <span>FAQ Analytics</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        
        <div className="flex-grow"></div>
        
        <SidebarGroup className="mt-auto border-t border-gray-800 pt-4">
          <SidebarGroupLabel className="text-gray-400 px-4">Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => signOut()} className="text-white hover:bg-red-500/10 hover:text-red-400 mx-2">
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
