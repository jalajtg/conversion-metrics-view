
import React from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { ProductSection } from './ProductSection';
import { toast } from '@/components/ui/use-toast';
import { Loader2, BarChart } from 'lucide-react';

export function Dashboard() {
  const { data: productMetrics, isLoading, error } = useDashboard();

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error loading dashboard",
        description: "There was a problem loading your dashboard data. Please try again later.",
        variant: "destructive",
      });
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px]">
        <Loader2 className="h-12 w-12 text-theme-blue animate-spin" />
        <p className="mt-4 text-gray-400">Loading your dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 gradient-text">Sales Dashboard</h1>
        <p className="text-gray-400">Track your sales metrics across all products</p>
      </div>
      
      {productMetrics?.length === 0 ? (
        <div className="bg-theme-dark-lighter border border-theme-blue/20 rounded-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-theme-blue/10 mb-4">
            <BarChart className="h-8 w-8 text-theme-blue" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No data available</h3>
          <p className="text-gray-400 max-w-md mx-auto">Start adding products, leads, and sales to see your metrics here.</p>
        </div>
      ) : (
        <>
          {productMetrics?.map((metrics) => (
            <ProductSection key={metrics.product.id} metrics={metrics} />
          ))}
        </>
      )}
    </div>
  );
}
