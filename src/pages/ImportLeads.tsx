import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
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
  const { toast } = useToast();

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Upload className="h-6 w-6 text-theme-blue" />
        <h1 className="text-2xl font-bold text-white">Import Airtable Leads</h1>
      </div>

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
    </div>
  );
}