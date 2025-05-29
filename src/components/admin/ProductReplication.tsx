
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2, Copy, CheckCircle } from 'lucide-react';
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
      const data = await getClinicProductCounts();
      setClinics(data);
      
      // Auto-select the clinic with the most products as source
      const clinicWithProducts = data.find(clinic => clinic.product_count > 0);
      if (clinicWithProducts) {
        setSelectedSourceClinic(clinicWithProducts.id);
      }
    } catch (error) {
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

    setIsLoading(true);
    try {
      const results = await replicateProductsToAllClinics(selectedSourceClinic);
      setReplicationResults(results);
      
      const totalReplicated = results.reduce((sum, result) => sum + result.products_replicated, 0);
      
      toast({
        title: "Products replicated successfully",
        description: `Replicated ${totalReplicated} products to ${results.length} clinics.`,
      });

      // Refresh clinic data to show updated counts
      await fetchClinicData();
    } catch (error) {
      toast({
        title: "Replication failed",
        description: "Failed to replicate products. Please try again.",
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

    setIsLoading(true);
    try {
      const replicatedCount = await replicateProductsToSpecificClinic(selectedSourceClinic, selectedTargetClinic);
      
      toast({
        title: "Products replicated successfully",
        description: `Replicated ${replicatedCount} products to the selected clinic.`,
      });

      // Refresh clinic data to show updated counts
      await fetchClinicData();
    } catch (error) {
      toast({
        title: "Replication failed",
        description: "Failed to replicate products. Please try again.",
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Product Replication
          </CardTitle>
          <CardDescription>
            Replicate products from one clinic to others. This helps maintain consistency across all your clinics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Clinic Product Overview */}
          <div>
            <h3 className="text-lg font-medium mb-3">Clinic Product Overview</h3>
            <div className="grid gap-2">
              {clinics.map((clinic) => (
                <div key={clinic.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{clinic.name}</span>
                  <span className="text-sm text-gray-600">{clinic.product_count} products</span>
                </div>
              ))}
            </div>
          </div>

          {/* Source Clinic Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Source Clinic (with products)</label>
            <Select value={selectedSourceClinic} onValueChange={setSelectedSourceClinic}>
              <SelectTrigger>
                <SelectValue placeholder="Select source clinic" />
              </SelectTrigger>
              <SelectContent>
                {clinics.filter(clinic => clinic.product_count > 0).map((clinic) => (
                  <SelectItem key={clinic.id} value={clinic.id}>
                    {clinic.name} ({clinic.product_count} products)
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
              <p className="text-sm text-gray-600 mt-1">
                This will copy all products from the selected clinic to all other clinics
              </p>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Or replicate to a specific clinic:</h4>
              <div className="space-y-2">
                <Select value={selectedTargetClinic} onValueChange={setSelectedTargetClinic}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target clinic" />
                  </SelectTrigger>
                  <SelectContent>
                    {clinics.filter(clinic => clinic.id !== selectedSourceClinic).map((clinic) => (
                      <SelectItem key={clinic.id} value={clinic.id}>
                        {clinic.name} ({clinic.product_count} products)
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
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Last Replication Results
              </h4>
              <div className="space-y-2">
                {replicationResults.map((result) => (
                  <div key={result.target_clinic_id} className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="text-sm">{result.clinic_name}</span>
                    <span className="text-sm font-medium text-green-700">
                      {result.products_replicated} products replicated
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
