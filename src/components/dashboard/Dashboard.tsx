
import React from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { ProductSection } from './ProductSection';
import { toast } from '@/components/ui/use-toast';

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
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Sales Dashboard</h1>
      <p className="text-gray-500 mb-8">Track your sales metrics across all products</p>
      
      {productMetrics?.length === 0 ? (
        <div className="bg-purple-50 rounded-xl p-6 text-center">
          <h3 className="text-xl font-medium text-purple-700 mb-2">No data available</h3>
          <p className="text-gray-600">Start adding products, leads, and sales to see your metrics here.</p>
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
