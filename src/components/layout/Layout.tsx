
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { AppSidebar } from './Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export function Layout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-theme-dark">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <Header />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
