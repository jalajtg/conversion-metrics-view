
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarHeader, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutDashboard, LogOut, Building2, Package, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function SuperAdminSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="border-r border-gray-800 bg-theme-dark-lighter">
      <SidebarHeader className="border-b border-gray-800 bg-theme-dark-lighter">
        <div className="px-4 py-4 flex items-center gap-3">
          <img 
            src="/lovable-uploads/460f8654-9a04-4cac-a568-cd5421a2911e.png" 
            alt="Logo" 
            className="h-8" 
          />
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-theme-dark-lighter">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 px-4">Super Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/super-admin')} className="hover:bg-theme-dark-card hover:text-theme-blue mx-2">
                  <Link to="/super-admin" className={isActive('/super-admin') ? "bg-theme-dark-card text-theme-blue" : "text-white"}>
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/super-admin/users')} className="hover:bg-theme-dark-card hover:text-theme-blue mx-2">
                  <Link to="/super-admin/users" className={isActive('/super-admin/users') ? "bg-theme-dark-card text-theme-blue" : "text-white"}>
                    <Users />
                    <span>Users</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/super-admin/clinics')} className="hover:bg-theme-dark-card hover:text-theme-blue mx-2">
                  <Link to="/super-admin/clinics" className={isActive('/super-admin/clinics') ? "bg-theme-dark-card text-theme-blue" : "text-white"}>
                    <Building2 />
                    <span>Clinics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/super-admin/products')} className="hover:bg-theme-dark-card hover:text-theme-blue mx-2">
                  <Link to="/super-admin/products" className={isActive('/super-admin/products') ? "bg-theme-dark-card text-theme-blue" : "text-white"}>
                    <Package />
                    <span>Products</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/super-admin/add-clinic')} className="hover:bg-theme-dark-card hover:text-theme-blue mx-2">
                  <Link to="/super-admin/add-clinic" className={isActive('/super-admin/add-clinic') ? "bg-theme-dark-card text-theme-blue" : "text-white"}>
                    <Building2 />
                    <span>Add Clinic</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
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
