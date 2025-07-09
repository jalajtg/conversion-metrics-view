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
    
    console.log('Starting bulletproof import process...');
    
    if (!airtableData || !Array.isArray(airtableData)) {
      return new Response(JSON.stringify({ error: 'Invalid lead data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Processing ${airtableData.length} leads with UPSERT logic...`);

    const result: ImportResult = {
      success: true,
      newLeads: 0,
      updatedLeads: 0,
      errors: [],
      details: []
    };

    const leadRecords = airtableData as LeadRecord[];
    
    // Process records in smaller batches to avoid resource limits
    const BATCH_SIZE = 10; // Reduced from 50 to prevent worker limits
    const batches = [];
    
    for (let i = 0; i < leadRecords.length; i += BATCH_SIZE) {
      batches.push(leadRecords.slice(i, i + BATCH_SIZE));
    }
    
    console.log(`Processing ${leadRecords.length} records in ${batches.length} batches of ${BATCH_SIZE}`);

    // Process each batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`Processing batch ${batchIndex + 1}/${batches.length}`);
      
      // Process batch records in parallel
      const batchPromises = batch.map(async (record) => {
        try {
          // Allow records without client_name - just set to null

          // Validate UUIDs if provided
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          
          if (record.clinic_id && !uuidRegex.test(record.clinic_id)) {
            return {
              error: `Invalid clinic_id format for ${record.client_name}`,
              name: record.client_name,
              status: 'error' as const,
              message: 'Invalid clinic_id format'
            };
          }

          if (record.product_id && !uuidRegex.test(record.product_id)) {
            return {
              error: `Invalid product_id format for ${record.client_name}`,
              name: record.client_name,
              status: 'error' as const,
              message: 'Invalid product_id format'
            };
          }

          // Prepare lead data
          const leadData = {
            product_id: record.product_id || null,
            client_name: record.client_name?.trim() || null,
            email: record.email?.trim() || null,
            phone: record.phone?.trim() || null,
            clinic_id: record.clinic_id || null,
            engaged: record.engaged ?? false,
            lead: record.lead ?? false,
            booked: record.booked ?? false,
            booking: record.booking || null,
            old_user_id: record.old_user_id?.trim() || null,
            automation: record.automation || null,
            created_at: record.created_at
          };

          // BULLETPROOF UPSERT LOGIC
          let upsertResult;
          let wasUpdate = false;
          
          if (leadData.old_user_id) {
            // Priority 1: UPSERT by old_user_id (guaranteed unique now)
            upsertResult = await supabaseClient
              .from('leads')
              .upsert(leadData, { 
                onConflict: 'old_user_id',
                ignoreDuplicates: false 
              })
              .select('id');
            wasUpdate = true; // Assume update for old_user_id conflicts
              
          } else {
            // Priority 2-4: Check for existing by email, phone, then name
            let existingLead = null;
            
            if (leadData.email) {
              const { data } = await supabaseClient
                .from('leads')
                .select('id')
                .eq('email', leadData.email)
                .limit(1)
                .maybeSingle();
              existingLead = data;
            }
            
            if (!existingLead && leadData.phone) {
              const { data } = await supabaseClient
                .from('leads')
                .select('id')
                .eq('phone', leadData.phone)
                .limit(1)
                .maybeSingle();
              existingLead = data;
            }
            
            if (!existingLead && leadData.client_name) {
              const { data } = await supabaseClient
                .from('leads')
                .select('id')
                .eq('client_name', leadData.client_name)
                .limit(1)
                .maybeSingle();
              existingLead = data;
            }
            
            if (existingLead) {
              // Update existing record
              upsertResult = await supabaseClient
                .from('leads')
                .update(leadData)
                .eq('id', existingLead.id)
                .select('id');
              wasUpdate = true;
            } else {
              // Insert new record
              upsertResult = await supabaseClient
                .from('leads')
                .insert(leadData)
                .select('id');
              wasUpdate = false;
            }
          }

          // Handle result
          if (upsertResult.error) {
            return {
              error: `Failed to process ${record.client_name}: ${upsertResult.error.message}`,
              name: record.client_name,
              status: 'error' as const,
              message: upsertResult.error.message
            };
          } else {
            return {
              name: record.client_name,
              status: wasUpdate ? 'updated' as const : 'created' as const
            };
          }

        } catch (error) {
          return {
            error: `Error processing ${record.client_name}: ${error.message}`,
            name: record.client_name,
            status: 'error' as const,
            message: error.message
          };
        }
      });

      // Wait for batch to complete
      const batchResults = await Promise.all(batchPromises);
      
      // Process batch results
      for (const batchResult of batchResults) {
        if (batchResult.error) {
          result.errors.push(batchResult.error);
        }
        
        if (batchResult.status === 'updated') {
          result.updatedLeads++;
        } else if (batchResult.status === 'created') {
          result.newLeads++;
        }
        
        result.details.push({
          name: batchResult.name,
          status: batchResult.status,
          message: batchResult.message
        });
      }
      
      console.log(`Batch ${batchIndex + 1} completed: ${batchResults.length} records processed`);
      
      // Add delay between batches to prevent resource exhaustion
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
      }
    }

    result.success = result.errors.length === 0;

    console.log(`Import completed: ${result.newLeads} new, ${result.updatedLeads} updated, ${result.errors.length} errors`);

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