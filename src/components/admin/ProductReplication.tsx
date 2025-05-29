
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2, Copy, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { 
  getClinicProductCounts, 
  replicateProductsToAllClinics,
  replicateProductsToSpecificClinic 
} from '@/services/productReplicationService';

interface ClinicProductCount {
  id: string;
  name: string;
  product_count: number;
}

interface ReplicationResult {
  target_clinic_id: string;
  clinic_name: string;
  products_replicated: number;
  success: boolean;
}

export function ProductReplication() {
  const [clinics, setClinics] = useState<ClinicProductCount[]>([]);
  const [selectedSourceClinic, setSelectedSourceClinic] = useState<string>('');
  const [selectedTargetClinic, setSelectedTargetClinic] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [replicationResults, setReplicationResults] = useState<ReplicationResult[]>([]);

  useEffect(() => {
    fetchClinicData();
  }, []);

  const fetchClinicData = async () => {
    try {
      setIsFetching(true);
      console.log('Starting to fetch clinic data...');
      const data = await getClinicProductCounts();
      console.log('Fetched clinic data:', data);
      setClinics(data);
      
      // Auto-select the clinic with the most products as source
      const clinicWithProducts = data.find(clinic => clinic.product_count > 0);
      if (clinicWithProducts) {
        setSelectedSourceClinic(clinicWithProducts.id);
        console.log('Auto-selected source clinic:', clinicWithProducts.name);
      }
    } catch (error) {
      console.error('Error in fetchClinicData:', error);
      toast({
        title: "Error loading clinics",
        description: "Failed to load clinic data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleReplicateToAll = async () => {
    if (!selectedSourceClinic) {
      toast({
        title: "No source clinic selected",
        description: "Please select a source clinic first.",
        variant: "destructive",
      });
      return;
    }

    const sourceClinic = clinics.find(c => c.id === selectedSourceClinic);
    if (!sourceClinic || sourceClinic.product_count === 0) {
      toast({
        title: "No products to replicate",
        description: "The selected clinic has no products to replicate.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setReplicationResults([]);
    
    try {
      console.log('Starting replication to all clinics...');
      const results = await replicateProductsToAllClinics(selectedSourceClinic);
      console.log('Replication results received:', results);
      setReplicationResults(results);
      
      const successfulReplications = results.filter(r => r.success);
      const totalReplicated = successfulReplications.reduce((sum, result) => sum + result.products_replicated, 0);
      const failedReplications = results.filter(r => !r.success);
      
      if (failedReplications.length > 0) {
        toast({
          title: "Partial replication completed",
          description: `Replicated ${totalReplicated} products to ${successfulReplications.length} clinics. ${failedReplications.length} failed.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Products replicated successfully",
          description: `Replicated ${totalReplicated} products to ${results.length} clinics.`,
        });
      }

      // Refresh clinic data to show updated counts
      await fetchClinicData();
    } catch (error) {
      console.error('Replication to all failed:', error);
      toast({
        title: "Replication failed",
        description: error instanceof Error ? error.message : "Failed to replicate products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplicateToOne = async () => {
    if (!selectedSourceClinic || !selectedTargetClinic) {
      toast({
        title: "Missing selection",
        description: "Please select both source and target clinics.",
        variant: "destructive",
      });
      return;
    }

    if (selectedSourceClinic === selectedTargetClinic) {
      toast({
        title: "Invalid selection",
        description: "Source and target clinics cannot be the same.",
        variant: "destructive",
      });
      return;
    }

    const sourceClinic = clinics.find(c => c.id === selectedSourceClinic);
    if (!sourceClinic || sourceClinic.product_count === 0) {
      toast({
        title: "No products to replicate",
        description: "The selected source clinic has no products to replicate.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Starting replication to specific clinic...');
      const replicatedCount = await replicateProductsToSpecificClinic(selectedSourceClinic, selectedTargetClinic);
      console.log('Replicated count:', replicatedCount);
      
      const targetClinic = clinics.find(c => c.id === selectedTargetClinic);
      
      if (replicatedCount > 0) {
        toast({
          title: "Products replicated successfully",
          description: `Replicated ${replicatedCount} products to ${targetClinic?.name || 'the selected clinic'}.`,
        });
      } else {
        toast({
          title: "No new products replicated",
          description: `All products already exist in ${targetClinic?.name || 'the selected clinic'}.`,
        });
      }

      // Refresh clinic data to show updated counts
      await fetchClinicData();
    } catch (error) {
      console.error('Replication to specific clinic failed:', error);
      toast({
        title: "Replication failed",
        description: error instanceof Error ? error.message : "Failed to replicate products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Copy className="h-5 w-5" />
            Product Replication
          </CardTitle>
          <CardDescription className="text-sm">
            Replicate products from one clinic to others. This helps maintain consistency across all your clinics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Clinic Product Overview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-medium">Clinic Product Overview</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchClinicData}
                disabled={isFetching}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            <div className="grid gap-2">
              {clinics.map((clinic) => (
                <div key={clinic.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-sm sm:text-base truncate flex-1 mr-2">{clinic.name}</span>
                  <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                    {clinic.product_count} product{clinic.product_count !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Source Clinic Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Source Clinic (with products)</label>
            <Select value={selectedSourceClinic} onValueChange={setSelectedSourceClinic}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select source clinic" />
              </SelectTrigger>
              <SelectContent>
                {clinics.filter(clinic => clinic.product_count > 0).map((clinic) => (
                  <SelectItem key={clinic.id} value={clinic.id}>
                    <span className="truncate">{clinic.name} ({clinic.product_count} products)</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Replication Actions */}
          <div className="space-y-4">
            <div>
              <Button 
                onClick={handleReplicateToAll}
                disabled={isLoading || !selectedSourceClinic}
                className="w-full"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Replicate to All Other Clinics
              </Button>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                This will copy all products from the selected clinic to all other clinics
              </p>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2 text-sm sm:text-base">Or replicate to a specific clinic:</h4>
              <div className="space-y-2">
                <Select value={selectedTargetClinic} onValueChange={setSelectedTargetClinic}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select target clinic" />
                  </SelectTrigger>
                  <SelectContent>
                    {clinics.filter(clinic => clinic.id !== selectedSourceClinic).map((clinic) => (
                      <SelectItem key={clinic.id} value={clinic.id}>
                        <span className="truncate">{clinic.name} ({clinic.product_count} products)</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleReplicateToOne}
                  disabled={isLoading || !selectedSourceClinic || !selectedTargetClinic}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Replicate to Selected Clinic
                </Button>
              </div>
            </div>
          </div>

          {/* Replication Results */}
          {replicationResults.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3 flex items-center gap-2 text-sm sm:text-base">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Last Replication Results
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {replicationResults.map((result) => (
                  <div 
                    key={result.target_clinic_id} 
                    className={`flex justify-between items-center p-2 rounded text-sm ${
                      result.success ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate flex-1 mr-2">
                      {result.success ? (
                        <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-600 flex-shrink-0" />
                      )}
                      <span className="truncate">{result.clinic_name}</span>
                    </div>
                    <span className={`font-medium whitespace-nowrap ${
                      result.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {result.success 
                        ? `${result.products_replicated} replicated` 
                        : 'Failed'
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
