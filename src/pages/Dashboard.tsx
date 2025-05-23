
import React from 'react';
import { Dashboard as DashboardComponent } from "@/components/dashboard/Dashboard";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      <DashboardComponent />
    </div>
  );
}
