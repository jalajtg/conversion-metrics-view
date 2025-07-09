import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AirtableRecord {
  id: string;
  createdTime: string;
  Name: string;
  Automation?: string;
  Clinic: string;
  Email: string;
  Phone: string;
  "Lead Created"?: string;
}

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user is super admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if user is super admin
    const { data: userRole, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || userRole?.role !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { airtableData } = await req.json();
    
    if (!airtableData || !Array.isArray(airtableData)) {
      return new Response(JSON.stringify({ error: 'Invalid airtable data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get all clinics for name mapping
    const { data: clinics, error: clinicsError } = await supabaseClient
      .from('clinics')
      .select('id, name');

    if (clinicsError) {
      return new Response(JSON.stringify({ error: 'Failed to fetch clinics' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create clinic lookup map
    const clinicMap = new Map<string, string>();
    clinics?.forEach(clinic => {
      clinicMap.set(clinic.name, clinic.id);
    });

    const result: ImportResult = {
      success: true,
      newLeads: 0,
      updatedLeads: 0,
      errors: [],
      details: []
    };

    // Process each Airtable record
    for (const record of airtableData as AirtableRecord[]) {
      try {
        // Find clinic ID
        const clinicId = clinicMap.get(record.Clinic);
        if (!clinicId) {
          result.errors.push(`Clinic not found: ${record.Clinic} for ${record.Name}`);
          result.details.push({
            name: record.Name,
            status: 'error',
            message: `Clinic not found: ${record.Clinic}`
          });
          continue;
        }

        // Map Airtable record to Supabase lead
        const leadData = {
          old_user_id: record.id,
          client_name: record.Name,
          email: record.Email,
          phone: record.Phone,
          automation: record.Automation || null,
          clinic_id: clinicId,
          lead: record["Lead Created"] === "Yes",
          created_at: new Date(record.createdTime).toISOString()
        };

        // Check if lead already exists
        const { data: existingLead, error: findError } = await supabaseClient
          .from('leads')
          .select('id')
          .eq('old_user_id', record.id)
          .single();

        if (findError && findError.code !== 'PGRST116') {
          result.errors.push(`Error checking existing lead for ${record.Name}: ${findError.message}`);
          result.details.push({
            name: record.Name,
            status: 'error',
            message: `Database error: ${findError.message}`
          });
          continue;
        }

        if (existingLead) {
          // Update existing lead
          const { error: updateError } = await supabaseClient
            .from('leads')
            .update(leadData)
            .eq('id', existingLead.id);

          if (updateError) {
            result.errors.push(`Failed to update lead ${record.Name}: ${updateError.message}`);
            result.details.push({
              name: record.Name,
              status: 'error',
              message: `Update failed: ${updateError.message}`
            });
          } else {
            result.updatedLeads++;
            result.details.push({
              name: record.Name,
              status: 'updated'
            });
          }
        } else {
          // Create new lead
          const { error: insertError } = await supabaseClient
            .from('leads')
            .insert([leadData]);

          if (insertError) {
            result.errors.push(`Failed to create lead ${record.Name}: ${insertError.message}`);
            result.details.push({
              name: record.Name,
              status: 'error',
              message: `Creation failed: ${insertError.message}`
            });
          } else {
            result.newLeads++;
            result.details.push({
              name: record.Name,
              status: 'created'
            });
          }
        }
      } catch (error) {
        result.errors.push(`Error processing ${record.Name}: ${error.message}`);
        result.details.push({
          name: record.Name,
          status: 'error',
          message: error.message
        });
      }
    }

    result.success = result.errors.length === 0;

    console.log('Import completed:', {
      totalProcessed: airtableData.length,
      newLeads: result.newLeads,
      updatedLeads: result.updatedLeads,
      errors: result.errors.length
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Import error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});