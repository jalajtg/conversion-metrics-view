
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
    <Sidebar className="border-b border-gray-800 bg-theme-dark-lighter">
      <SidebarHeader className="bg-zinc-800">
        <div className="px-4 py-4 flex items-center gap-3">
          <img src="/lovable-uploads/bfb01530-83c3-492e-9590-62372077dda7.png" alt="Logo" className="h-8" />
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-zinc-800">
        <SidebarGroup className="bg-zinc-800">
          <SidebarGroupLabel className="text-gray-400">Pages</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isSuperAdmin ? (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/super-admin')} className="hover:bg-theme-dark-card hover:text-theme-blue">
                    <Link to="/super-admin" className={isActive('/super-admin') ? "bg-theme-dark-card text-theme-blue" : "text-white"}>
                      <Shield />
                      <span>Super Admin</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/dashboard')} className="hover:bg-theme-dark-card hover:text-theme-blue">
                      <Link to="/dashboard" className={isActive('/dashboard') ? "bg-theme-dark-card text-theme-blue" : "text-white"}>
                        <LayoutDashboard />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/faq')} className="hover:bg-theme-dark-card hover:text-theme-blue">
                      <Link to="/faq" className={isActive('/faq') ? "bg-theme-dark-card text-theme-blue" : "text-white"}>
                        <HelpCircle />
                        <span>FAQ</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isDashboard && !isSuperAdmin && (
          <SidebarGroup className="bg-zinc-800">
            <SidebarGroupLabel className="text-gray-400">Quick Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => scrollToSection('bookings-section')} className="text-white hover:bg-theme-dark-card hover:text-theme-blue cursor-pointer">
                    <Calendar />
                    <span>Bookings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => scrollToSection('faq-section')} className="text-white hover:bg-theme-dark-card hover:text-theme-blue cursor-pointer">
                    <MessageCircle />
                    <span>FAQ Analytics</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        
        <div className="flex-grow"></div>
        
        <SidebarGroup className="mt-auto">
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
