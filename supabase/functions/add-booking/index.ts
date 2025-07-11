import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingData {
  name: string;
  email?: string;
  phone?: string;
  booking_time: string;
  clinic_id?: string;
  product_id?: string;
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

    const { bookings, webhookSecret } = await req.json();

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
      console.log('Processing webhook booking import request');
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
    
    console.log('Starting booking import process...');
    
    if (!bookings || !Array.isArray(bookings)) {
      return new Response(JSON.stringify({ error: 'Invalid booking data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Processing ${bookings.length} bookings...`);

    const result = {
      success: true,
      newBookings: 0,
      errors: [],
      details: []
    };

    const bookingRecords = bookings as BookingData[];
    
    // Process records in smaller batches
    const BATCH_SIZE = 10;
    const batches = [];
    
    for (let i = 0; i < bookingRecords.length; i += BATCH_SIZE) {
      batches.push(bookingRecords.slice(i, i + BATCH_SIZE));
    }
    
    console.log(`Processing ${bookingRecords.length} records in ${batches.length} batches of ${BATCH_SIZE}`);

    // Process each batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`Processing batch ${batchIndex + 1}/${batches.length}`);
      
      // Process batch records in parallel
      const batchPromises = batch.map(async (record) => {
        try {
          // Validate required fields
          if (!record.name || !record.booking_time) {
            return {
              error: `Missing required fields for ${record.name}`,
              name: record.name,
              status: 'error' as const,
              message: 'Missing name or booking_time'
            };
          }

          // Validate booking_time is a valid date
          const bookingTime = new Date(record.booking_time);
          if (isNaN(bookingTime.getTime())) {
            return {
              error: `Invalid booking_time format for ${record.name}`,
              name: record.name,
              status: 'error' as const,
              message: 'Invalid booking_time format'
            };
          }

          // Map product_category_id to clinic_product_categories.id if provided
          let validatedProductId = null;
          if (record.product_id && record.clinic_id) {
            const { data: clinicProduct } = await supabaseClient
              .from('clinic_product_categories')
              .select('id')
              .eq('product_category_id', record.product_id)
              .eq('clinic_id', record.clinic_id)
              .single();
            
            if (clinicProduct) {
              validatedProductId = clinicProduct.id;
            } else {
              console.log(`No clinic_product_category found for product_category_id ${record.product_id} and clinic_id ${record.clinic_id} for ${record.name}`);
            }
          }

          // Validate user_id is a valid UUID format, otherwise set to null
          let validatedUserId = null;
          if (record.user_id) {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (uuidRegex.test(record.user_id)) {
              validatedUserId = record.user_id;
            } else {
              console.log(`Invalid UUID format for user_id "${record.user_id}" for ${record.name}, setting to null`);
            }
          }

          // Prepare booking data
          const bookingData = {
            name: record.name.trim(),
            email: record.email?.trim() || null,
            phone: record.phone?.trim() || null,
            booking_time: record.booking_time,
            clinic_id: record.clinic_id || null,
            product_id: validatedProductId,
            user_id: validatedUserId,
            created_at: new Date().toISOString()
          };

          // Insert booking
          const insertResult = await supabaseClient
            .from('bookings')
            .insert(bookingData)
            .select('id');

          if (insertResult.error) {
            return {
              error: `Failed to create booking for ${record.name}: ${insertResult.error.message}`,
              name: record.name,
              status: 'error' as const,
              message: insertResult.error.message
            };
          } else {
            return {
              name: record.name,
              status: 'created' as const
            };
          }

        } catch (error) {
          return {
            error: `Error processing booking for ${record.name}: ${error.message}`,
            name: record.name,
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
        
        if (batchResult.status === 'created') {
          result.newBookings++;
        }
        
        result.details.push({
          name: batchResult.name,
          status: batchResult.status,
          message: batchResult.message
        });
      }
      
      console.log(`Batch ${batchIndex + 1} completed: ${batchResults.length} records processed`);
      
      // Add delay between batches
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    result.success = result.errors.length === 0;

    console.log(`Import completed: ${result.newBookings} new bookings, ${result.errors.length} errors`);

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