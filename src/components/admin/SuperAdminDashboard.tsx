
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Package, BookOpen, MessageSquare, DollarSign, TrendingUp, TrendingDown, Building2 } from 'lucide-react';
import { useSuperAdminMetrics } from '@/hooks/useSuperAdminMetrics';
import { SuperAdminFilters } from './SuperAdminFilters';
import { UserManagement } from './UserManagement';
import ClinicsPage from '@/pages/Clinics';
import ProductsPage from '@/pages/Products';
import type { SuperAdminFilters as SuperAdminFiltersType } from '@/types/admin';

type ActiveTab = 'dashboard' | 'clinics' | 'products';

export function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const currentDate = new Date();
  const [filters, setFilters] = useState<SuperAdminFiltersType>({
    clinicIds: [],
    startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0],
    endDate: currentDate.toISOString().split('T')[0]
  });

  const { data: metrics, isLoading } = useSuperAdminMetrics(filters);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'clinics':
        return <ClinicsPage />;
      case 'products':
        return <ProductsPage />;
      default:
        return (
          <>
            {/* User Management Section */}
            <div className="mb-8">
              <UserManagement />
            </div>

            {/* Filters */}
            <div className="mb-6">
              <SuperAdminFilters filters={filters} onFiltersChange={setFilters} />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {metricCards.map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <Card key={index} className="bg-theme-dark-card border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">
                        {metric.title}
                      </CardTitle>
                      <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                        <IconComponent className={`h-4 w-4 ${metric.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">
                        {metric.value}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Clinic Details */}
            {metrics?.clinicDetails && metrics.clinicDetails.length > 0 && (
              <Card className="bg-theme-dark-card border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Clinic Performance Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-gray-400">Clinic Name</th>
                          <th className="text-left py-3 px-4 text-gray-400">Products</th>
                          <th className="text-left py-3 px-4 text-gray-400">Bookings</th>
                          <th className="text-left py-3 px-4 text-gray-400">Leads</th>
                          <th className="text-left py-3 px-4 text-gray-400">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {metrics.clinicDetails.map((clinic) => (
                          <tr key={clinic.id} className="border-b border-gray-800">
                            <td className="py-3 px-4 text-white font-medium">{clinic.name}</td>
                            <td className="py-3 px-4 text-gray-300">{clinic.productCount}</td>
                            <td className="py-3 px-4 text-gray-300">{clinic.bookingCount}</td>
                            <td className="py-3 px-4 text-gray-300">{clinic.leadCount}</td>
                            <td className="py-3 px-4 text-gray-300">${clinic.revenue.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        );
    }
  };

  if (isLoading && activeTab === 'dashboard') {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] px-4">
        <div className="h-12 w-12 border-4 border-theme-blue border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-400 text-center">Loading admin dashboard...</p>
      </div>
    );
  }

  const metricCards = [
    {
      title: 'Total Clinics',
      value: metrics?.totalClinics || 0,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Total Products',
      value: metrics?.totalProducts || 0,
      icon: Package,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Total Bookings',
      value: metrics?.totalBookings || 0,
      icon: Calendar,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Total Leads',
      value: metrics?.totalLeads || 0,
      icon: TrendingUp,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      title: 'Total Conversations',
      value: metrics?.totalConversations || 0,
      icon: MessageSquare,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10'
    },
    {
      title: 'Total Revenue',
      value: `$${(metrics?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
    {
      title: 'Cost per Booking',
      value: `$${(metrics?.costPerBooking || 0).toFixed(2)}`,
      icon: TrendingDown,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    },
    {
      title: 'Cost per Lead',
      value: `$${(metrics?.costPerLead || 0).toFixed(2)}`,
      icon: TrendingDown,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-theme-dark">
      <div className="container mx-auto py-4 sm:py-6 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Super Admin Panel
          </h1>
          <p className="text-gray-400">
            Manage users, monitor metrics, and oversee system operations
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-theme-dark-card p-1 rounded-lg border border-gray-800">
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 ${activeTab === 'dashboard' ? 'bg-theme-blue text-white' : 'text-gray-400 hover:text-white hover:bg-theme-dark-lighter'}`}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === 'clinics' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('clinics')}
              className={`flex-1 ${activeTab === 'clinics' ? 'bg-theme-blue text-white' : 'text-gray-400 hover:text-white hover:bg-theme-dark-lighter'}`}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Clinics
            </Button>
            <Button
              variant={activeTab === 'products' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('products')}
              className={`flex-1 ${activeTab === 'products' ? 'bg-theme-blue text-white' : 'text-gray-400 hover:text-white hover:bg-theme-dark-lighter'}`}
            >
              <Package className="h-4 w-4 mr-2" />
              Products
            </Button>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}
