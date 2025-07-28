import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UpsertNewPatientsRequest {
  clinic_id: string;
  month: number;
  year: number;
  count: number;
}

interface BatchUpsertNewPatientsRequest {
  records: UpsertNewPatientsRequest[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Upsert new patients request received:', req.method);

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    const requestBody = await req.json();
    console.log('Request body:', requestBody);

    // Check if this is a batch request or single request
    const isBatchRequest = requestBody.records && Array.isArray(requestBody.records);
    const records = isBatchRequest ? requestBody.records : [requestBody];

    // Validate all records
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      
      if (!record.clinic_id || !record.month || !record.year || record.count === undefined) {
        return new Response(
          JSON.stringify({ 
            error: `Missing required fields in record ${i}: clinic_id, month, year, count` 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      if (record.month < 1 || record.month > 12) {
        return new Response(
          JSON.stringify({ 
            error: `Month must be between 1 and 12 in record ${i}` 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      if (record.year < 2020 || record.year > 2100) {
        return new Response(
          JSON.stringify({ 
            error: `Year must be between 2020 and 2100 in record ${i}` 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      if (record.count < 0) {
        return new Response(
          JSON.stringify({ 
            error: `Count must be non-negative in record ${i}` 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('Proceeding with upsert (no authentication required)');

    // Prepare data for batch upsert (no user_id since no auth)
    const upsertData = records.map(record => ({
      clinic_id: record.clinic_id,
      month: record.month,
      year: record.year,
      count: record.count
    }));

    // Perform batch upsert operation
    const { data, error } = await supabase
      .from('new_patients')
      .upsert(upsertData, {
        onConflict: 'clinic_id,month,year',
        ignoreDuplicates: false
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save data', details: error.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Successfully upserted ${data.length} new patients records`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: data,
        message: `${data.length} new patients records saved successfully`,
        recordsProcessed: data.length
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});