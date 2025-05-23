
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { AppSidebar } from './Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export function Layout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        <Header />
        <div className="flex flex-1">
          <AppSidebar />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
