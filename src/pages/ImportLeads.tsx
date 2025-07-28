import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, CheckCircle, AlertCircle, XCircle, Webhook, Clock, Copy, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImportResult {
  success: boolean;
  newLeads: number;
  updatedLeads: number;
  errors: string[];
  details: Array<{
    name: string;
    status: 'created' | 'updated' | 'error';
    message?: string;
  }>;
}

export default function ImportLeads() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [preview, setPreview] = useState<any[] | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [zapierUrl, setZapierUrl] = useState('');
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [deduping, setDeduping] = useState(false);
  const [dedupeResult, setDedupeResult] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Generate webhook URL and secret on component mount
    const projectUrl = 'https://fhsjhoygllcchfinalih.supabase.co';
    // SECURITY WARNING: This should be moved to Supabase secrets for production
    const generatedSecret = 'REPLACE_WITH_SECURE_SECRET'; // Should be configured via Supabase secrets
    setWebhookUrl(`${projectUrl}/functions/v1/import-airtable-leads`);
    setWebhookSecret(generatedSecret);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setPreview(null);
      
      // Read and preview the file
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          setPreview(Array.isArray(data) ? data.slice(0, 5) : []);
        } catch (error) {
          toast({
            title: "Invalid file",
            description: "Please upload a valid JSON file",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const airtableData = JSON.parse(event.target?.result as string);
          
          const { data, error } = await supabase.functions.invoke('import-airtable-leads', {
            body: { airtableData }
          });

          if (error) {
            throw error;
          }

          setResult(data);
          toast({
            title: "Import completed",
            description: `${data.newLeads} new leads created, ${data.updatedLeads} updated`,
          });
        } catch (error) {
          console.error('Import error:', error);
          toast({
            title: "Import failed",
            description: error.message || "An error occurred during import",
            variant: "destructive",
          });
        } finally {
          setImporting(false);
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('File read error:', error);
      setImporting(false);
      toast({
        title: "File error",
        description: "Failed to read the selected file",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  const testWebhook = async () => {
    if (!zapierUrl) {
      toast({
        title: "Error",
        description: "Please enter your Zapier webhook URL",
        variant: "destructive",
      });
      return;
    }

    setTestingWebhook(true);
    
    try {
      const response = await fetch(zapierUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin,
          test_data: [
            {
              id: "test123",
              createdTime: new Date().toISOString(),
              Name: "Test Lead",
              Automation: "IB",
              Clinic: "Atascocita",
              Email: "test@example.com",
              Phone: "+1234567890",
              "Lead Created": "Yes"
            }
          ]
        }),
      });

      toast({
        title: "Test Request Sent",
        description: "Check your Zapier webhook history to confirm it was triggered.",
      });
    } catch (error) {
      console.error("Error testing webhook:", error);
      toast({
        title: "Error",
        description: "Failed to send test request. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setTestingWebhook(false);
    }
  };

  const handleDedupe = async () => {
    setDeduping(true);
    setDedupeResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('dedupe-leads');

      if (error) {
        throw error;
      }

      setDedupeResult(data);
      toast({
        title: "Deduplication completed",
        description: `${data.duplicatesRemoved} duplicates removed`,
      });
    } catch (error) {
      console.error('Deduplication error:', error);
      toast({
        title: "Deduplication failed",
        description: error.message || "An error occurred during deduplication",
        variant: "destructive",
      });
    } finally {
      setDeduping(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Upload className="h-6 w-6 text-theme-blue" />
        <h1 className="text-2xl font-bold text-white">Import Airtable Leads</h1>
      </div>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-theme-dark-card">
          <TabsTrigger value="manual" className="text-white">Manual Import</TabsTrigger>
          <TabsTrigger value="webhook" className="text-white">Webhook Setup</TabsTrigger>
          <TabsTrigger value="automation" className="text-white">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          <Card className="bg-theme-dark-card border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Upload Airtable Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload" className="text-gray-300">
                  Select JSON file exported from Airtable
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="bg-theme-dark border-gray-700 text-white"
                />
              </div>

              {preview && (
                <div className="space-y-2">
                  <Label className="text-gray-300">Preview (first 5 records):</Label>
                  <div className="bg-theme-dark p-3 rounded-md border border-gray-700">
                    <pre className="text-xs text-gray-400 overflow-x-auto">
                      {JSON.stringify(preview, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleImport} 
                disabled={!file || importing}
                className="w-full bg-theme-blue hover:bg-theme-blue/80"
              >
                {importing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Import Leads
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhook" className="space-y-6">
          <Card className="bg-theme-dark-card border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhook Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Webhook URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={webhookUrl}
                    readOnly
                    className="bg-theme-dark border-gray-700 text-white"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(webhookUrl)}
                    className="border-gray-700 text-gray-300"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Webhook Secret</Label>
                <div className="flex gap-2">
                  <Input
                    value={webhookSecret}
                    readOnly
                    className="bg-theme-dark border-gray-700 text-white"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(webhookSecret)}
                    className="border-gray-700 text-gray-300"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Alert className="bg-blue-500/10 border-blue-500/20">
                <AlertCircle className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300">
                  <strong>Webhook Usage:</strong> Send a POST request to the webhook URL with the following JSON structure:
                  <pre className="mt-2 text-xs bg-theme-dark p-2 rounded">
{`{
  "webhookSecret": "your-secure-webhook-secret",
  "airtableData": [
    {
      "product_id": "34675d35-0665-4941-892b-5d96b3ea29b7",
      "clinic_name": "Atascocita",
      "client_name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "created_at": "2025-06-19T14:20:09.000Z",
      "clinic_id": "c77bf6d1-159f-4845-8146-15b3fa37e42d",
      "engaged": false,
      "lead": true,
      "booked": false,
      "booking": null,
      "old_user_id": null,
      "automation": "IB"
    }
  ]
}`}
                  </pre>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card className="bg-theme-dark-card border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Automation Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Zapier Webhook URL</Label>
                  <Input
                    value={zapierUrl}
                    onChange={(e) => setZapierUrl(e.target.value)}
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                    className="bg-theme-dark border-gray-700 text-white"
                  />
                </div>

                <Button 
                  onClick={testWebhook} 
                  disabled={!zapierUrl || testingWebhook}
                  className="w-full bg-theme-blue hover:bg-theme-blue/80"
                >
                  {testingWebhook ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Testing...
                    </>
                  ) : (
                    <>
                      <Webhook className="h-4 w-4 mr-2" />
                      Test Zapier Webhook
                    </>
                  )}
                </Button>
              </div>

              <Alert className="bg-green-500/10 border-green-500/20">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-300">
                  <strong>Automation Options:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Set up a Zapier webhook to trigger imports from Airtable</li>
                    <li>• Configure scheduled triggers (hourly, daily, etc.)</li>
                    <li>• Connect to Airtable's API for real-time updates</li>
                    <li>• Use cron jobs for regular data synchronization</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label className="text-gray-300">Setup Instructions</Label>
                <div className="bg-theme-dark p-4 rounded-md border border-gray-700 text-sm text-gray-400">
                  <ol className="space-y-2 list-decimal list-inside">
                    <li>Create a new Zap in Zapier</li>
                    <li>Add a "Webhook by Zapier" trigger</li>
                    <li>Set it to "Catch Hook" and copy the webhook URL above</li>
                    <li>Add an "Airtable" step to get your leads data</li>
                    <li>Add a "Webhook by Zapier" action to send data to our import webhook</li>
                    <li>Set the webhook URL to: <code className="bg-theme-dark-card px-1 rounded">{webhookUrl}</code></li>
                    <li>Include the webhook secret in your payload</li>
                  </ol>
                </div>
              </div>

              <Button 
                variant="outline"
                className="w-full border-gray-700 text-gray-300"
                onClick={() => window.open('https://zapier.com/app/editor', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Zapier Editor
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {importing && (
        <Card className="bg-theme-dark-card border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-theme-blue"></div>
              <span className="text-white">Processing leads...</span>
            </div>
            <Progress value={45} className="mt-3" />
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="bg-theme-dark-card border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-gray-300">New Leads: </span>
                <Badge variant="secondary">{result.newLeads}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                <span className="text-gray-300">Updated Leads: </span>
                <Badge variant="secondary">{result.updatedLeads}</Badge>
              </div>
            </div>

            {result.errors.length > 0 && (
              <Alert className="bg-red-500/10 border-red-500/20">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  {result.errors.length} error(s) occurred during import
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label className="text-gray-300">Detailed Results:</Label>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {result.details.map((detail, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-theme-dark rounded text-sm">
                    {detail.status === 'created' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {detail.status === 'updated' && <CheckCircle className="h-4 w-4 text-blue-500" />}
                    {detail.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                    <span className="text-gray-300">{detail.name}</span>
                    <Badge variant={detail.status === 'error' ? 'destructive' : 'secondary'}>
                      {detail.status}
                    </Badge>
                    {detail.message && (
                      <span className="text-gray-400 text-xs">- {detail.message}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deduplication Section */}
      <Card className="bg-theme-dark-card border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-400" />
            Lead Deduplication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-gray-300 text-sm">
            Remove duplicate leads from the database. This will keep the most recent and complete record for each duplicate group.
          </div>
          
          <Button 
            onClick={handleDedupe} 
            disabled={deduping}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            {deduping ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deduplicating...
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 mr-2" />
                Remove Duplicate Leads
              </>
            )}
          </Button>

          {dedupeResult && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-gray-300">Duplicates Found: </span>
                  <Badge variant="secondary">{dedupeResult.duplicatesFound}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-gray-300">Duplicates Removed: </span>
                  <Badge variant="secondary">{dedupeResult.duplicatesRemoved}</Badge>
                </div>
              </div>

              {dedupeResult.errors?.length > 0 && (
                <Alert className="bg-red-500/10 border-red-500/20">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300">
                    {dedupeResult.errors.length} error(s) occurred during deduplication
                  </AlertDescription>
                </Alert>
              )}

              {dedupeResult.details?.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-gray-300">Deduplication Details:</Label>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {dedupeResult.details.map((detail: any, index: number) => (
                      <div key={index} className="p-2 bg-theme-dark rounded text-xs">
                        <div className="text-gray-300">
                          <strong>Key:</strong> {detail.key}
                        </div>
                        <div className="text-gray-400">
                          Found {detail.duplicateCount} duplicates, kept: {detail.keptRecord}
                        </div>
                        <div className="text-gray-500">
                          Removed: {detail.removedRecords?.length || 0} records
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}