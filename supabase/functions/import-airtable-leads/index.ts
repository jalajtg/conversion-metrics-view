import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeadRecord {
  product_id?: string;
  clinic_name: string;
  client_name: string;
  email?: string;
  phone?: string;
  created_at: string;
  clinic_id: string;
  engaged?: boolean;
  lead?: boolean;
  booked?: boolean;
  booking?: string;
  old_user_id?: string;
  automation?: string;
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

    const { airtableData, webhookSecret } = await req.json();

    // Check if this is a webhook call (has webhookSecret) or UI call (has auth header)
    const authHeader = req.headers.get('Authorization');
    const isWebhookCall = webhookSecret && !authHeader;
    
    if (isWebhookCall) {
      // Verify webhook secret
      const expectedSecret = Deno.env.get('WEBHOOK_SECRET') || 'your-secure-webhook-secret';
      if (webhookSecret !== expectedSecret) {
        return new Response(JSON.stringify({ error: 'Invalid webhook secret' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      console.log('Processing webhook import request');
    } else {
      // Original UI authentication flow
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
    }
    
    if (!airtableData || !Array.isArray(airtableData)) {
      return new Response(JSON.stringify({ error: 'Invalid lead data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Processing ${airtableData.length} leads...`);

    const result: ImportResult = {
      success: true,
      newLeads: 0,
      updatedLeads: 0,
      errors: [],
      details: []
    };

    const leadRecords = airtableData as LeadRecord[];
    
    // Batch size for processing
    const BATCH_SIZE = 100;
    
    // Get all existing leads with old_user_id or email for comparison
    const existingLeadsMap = new Map<string, string>();
    
    try {
      const { data: existingLeads, error: fetchError } = await supabaseClient
        .from('leads')
        .select('id, old_user_id, email, client_name');
        
      if (fetchError) {
        console.error('Error fetching existing leads:', fetchError);
      } else {
        existingLeads?.forEach(lead => {
          if (lead.old_user_id) {
            existingLeadsMap.set(`old_id:${lead.old_user_id}`, lead.id);
          }
          if (lead.email) {
            existingLeadsMap.set(`email:${lead.email}`, lead.id);
          }
        });
      }
    } catch (error) {
      console.error('Error building existing leads map:', error);
    }

    // Process records in batches
    for (let i = 0; i < leadRecords.length; i += BATCH_SIZE) {
      const batch = leadRecords.slice(i, i + BATCH_SIZE);
      const newLeads: any[] = [];
      const updateOps: Promise<any>[] = [];
      
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(leadRecords.length / BATCH_SIZE)}`);

      for (const record of batch) {
        try {
          // Validate clinic_id - it should be a valid UUID format
          if (!record.clinic_id) {
            result.errors.push(`Missing clinic_id for ${record.client_name}`);
            result.details.push({
              name: record.client_name,
              status: 'error',
              message: 'Missing clinic_id'
            });
            continue;
          }

          // Validate clinic_id is a valid UUID format
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(record.clinic_id)) {
            result.errors.push(`Invalid clinic_id format for ${record.client_name}: ${record.clinic_id}`);
            result.details.push({
              name: record.client_name,
              status: 'error',
              message: `Invalid clinic_id format: ${record.clinic_id}`
            });
            continue;
          }

          // Validate product_id if provided
          if (record.product_id && !uuidRegex.test(record.product_id)) {
            result.errors.push(`Invalid product_id format for ${record.client_name}: ${record.product_id}`);
            result.details.push({
              name: record.client_name,
              status: 'error',
              message: `Invalid product_id format: ${record.product_id}`
            });
            continue;
          }

          // Map the record to Supabase lead format
          const leadData = {
            product_id: record.product_id || null,
            client_name: record.client_name,
            email: record.email || null,
            phone: record.phone || null,
            clinic_id: record.clinic_id,
            engaged: record.engaged ?? false,
            lead: record.lead ?? false,
            booked: record.booked ?? false,
            booking: record.booking || null,
            old_user_id: record.old_user_id || null,
            automation: record.automation || null,
            created_at: record.created_at
          };

          // Check if lead exists by old_user_id or email
          let existingLeadId = null;
          if (record.old_user_id) {
            existingLeadId = existingLeadsMap.get(`old_id:${record.old_user_id}`);
          }
          if (!existingLeadId && record.email) {
            existingLeadId = existingLeadsMap.get(`email:${record.email}`);
          }

          if (existingLeadId) {
            // Queue update operation
            updateOps.push(
              supabaseClient
                .from('leads')
                .update(leadData)
                .eq('id', existingLeadId)
                .then(({ error }) => {
                  if (error) {
                    result.errors.push(`Failed to update lead ${record.client_name}: ${error.message}`);
                    result.details.push({
                      name: record.client_name,
                      status: 'error',
                      message: `Update failed: ${error.message}`
                    });
                  } else {
                    result.updatedLeads++;
                    result.details.push({
                      name: record.client_name,
                      status: 'updated'
                    });
                  }
                })
            );
          } else {
            // Add to new leads batch
            newLeads.push(leadData);
          }
        } catch (error) {
          result.errors.push(`Error processing ${record.client_name}: ${error.message}`);
          result.details.push({
            name: record.client_name,
            status: 'error',
            message: error.message
          });
        }
      }

      // Execute batch insert for new leads
      if (newLeads.length > 0) {
        try {
          const { error: insertError } = await supabaseClient
            .from('leads')
            .insert(newLeads);

          if (insertError) {
            console.error('Batch insert error:', insertError);
            newLeads.forEach(lead => {
              result.errors.push(`Failed to create lead ${lead.client_name}: ${insertError.message}`);
              result.details.push({
                name: lead.client_name,
                status: 'error',
                message: `Creation failed: ${insertError.message}`
              });
            });
          } else {
            result.newLeads += newLeads.length;
            newLeads.forEach(lead => {
              result.details.push({
                name: lead.client_name,
                status: 'created'
              });
            });
          }
        } catch (error) {
          console.error('Batch insert exception:', error);
          newLeads.forEach(lead => {
            result.errors.push(`Failed to create lead ${lead.client_name}: ${error.message}`);
            result.details.push({
              name: lead.client_name,
              status: 'error',
              message: error.message
            });
          });
        }
      }

      // Execute all update operations
      if (updateOps.length > 0) {
        await Promise.all(updateOps);
      }
    }

    result.success = result.errors.length === 0;

    const logMessage = isWebhookCall ? 'Webhook import completed' : 'Manual import completed';
    console.log(logMessage, {
      totalProcessed: airtableData.length,
      newLeads: result.newLeads,
      updatedLeads: result.updatedLeads,
      errors: result.errors.length,
      source: isWebhookCall ? 'webhook' : 'ui'
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