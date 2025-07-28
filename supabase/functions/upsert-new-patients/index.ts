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

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Upsert new patients request received:', req.method);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify the user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Authenticated user:', user.id);

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
    const body: UpsertNewPatientsRequest = await req.json();
    console.log('Request body:', body);

    // Validate required fields
    if (!body.clinic_id || !body.month || !body.year || body.count === undefined) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: clinic_id, month, year, count' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate month range
    if (body.month < 1 || body.month > 12) {
      return new Response(
        JSON.stringify({ 
          error: 'Month must be between 1 and 12' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate year range
    if (body.year < 2020 || body.year > 2100) {
      return new Response(
        JSON.stringify({ 
          error: 'Year must be between 2020 and 2100' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate count is non-negative
    if (body.count < 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Count must be non-negative' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify user has access to this clinic
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('id, owner_id')
      .eq('id', body.clinic_id)
      .single();

    if (clinicError || !clinic) {
      console.error('Clinic not found:', clinicError);
      return new Response(
        JSON.stringify({ error: 'Clinic not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if user owns this clinic or is super admin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'super_admin')
      .single();

    const isSuperAdmin = !!userRole;
    const isOwner = clinic.owner_id === user.id;

    if (!isSuperAdmin && !isOwner) {
      console.error('User does not have access to clinic:', user.id, clinic.id);
      return new Response(
        JSON.stringify({ error: 'Access denied to this clinic' }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('User has access to clinic, proceeding with upsert');

    // Perform upsert operation
    const { data, error } = await supabase
      .from('new_patients')
      .upsert(
        {
          clinic_id: body.clinic_id,
          month: body.month,
          year: body.year,
          count: body.count,
          user_id: user.id
        },
        {
          onConflict: 'clinic_id,month,year',
          ignoreDuplicates: false
        }
      )
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

    console.log('Successfully upserted new patients data:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: data[0],
        message: 'New patients data saved successfully'
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