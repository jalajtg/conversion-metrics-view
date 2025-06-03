
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get the current user to verify they're authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create regular client to verify user auth
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Verify user is super admin
    const { data: userRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (userRole?.role !== 'super_admin') {
      throw new Error('User not authorized for admin operations');
    }

    const { method } = req;

    if (method === 'GET') {
      console.log('Listing all users...');
      
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('id, name');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Get user roles
      const { data: userRoles, error: rolesError } = await supabaseAdmin
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        throw rolesError;
      }

      // Get auth users
      const { data: authUsersResponse, error: authError } = await supabaseAdmin.auth.admin.listUsers();

      if (authError) {
        console.error('Error fetching auth users:', authError);
        throw authError;
      }

      const authUsers = authUsersResponse.users || [];

      // Combine data
      const usersWithDetails = profiles.map(profile => {
        const userRole = userRoles.find(role => role.user_id === profile.id);
        const authUser = authUsers.find(user => user.id === profile.id);
        
        return {
          id: profile.id,
          name: profile.name,
          email: authUser?.email || 'No email found',
          role: userRole?.role || 'user',
          status: 'active'
        };
      });

      return new Response(
        JSON.stringify({ users: usersWithDetails }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'POST') {
      const { name, email } = await req.json();
      console.log('Creating user:', { name, email });

      // Generate random password
      const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase() + '1!';
      
      // Create user in auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          name: name,
        },
      });

      if (authError || !authData.user) {
        console.error('Auth error:', authError);
        throw authError || new Error('Failed to create user');
      }

      console.log('User created in auth:', authData.user.id);

      // Create profile - use INSERT instead of UPSERT to avoid constraint issues
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          name: name,
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }

      // Assign user role - use INSERT instead of UPSERT to avoid constraint issues
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'user',
        });

      if (roleError) {
        console.error('Error assigning user role:', roleError);
      }

      // Send notification email
      const { error: emailError } = await supabaseAdmin.rpc('send_user_notification_email', {
        p_user_id: authData.user.id,
        p_email_type: 'new_user',
        p_clinic_name: null,
        p_password: password,
      });

      if (emailError) {
        console.error('Error sending notification email:', emailError);
      }

      return new Response(
        JSON.stringify({ user: authData.user, success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'PUT') {
      const { id, role } = await req.json();
      console.log('Updating user role:', { id, role });

      const { error } = await supabaseAdmin
        .from('user_roles')
        .update({ role: role })
        .eq('user_id', id);
      
      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'DELETE') {
      const { id } = await req.json();
      console.log('Deleting user:', id);
      
      // Delete user role
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', id);
      
      if (roleError) {
        console.error('Error deleting user role:', roleError);
      }

      // Delete profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', id);
      
      if (profileError) {
        console.error('Error deleting profile:', profileError);
      }

      // Delete from auth
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
      
      if (authError) {
        console.error('Error deleting auth user:', authError);
        throw authError;
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid method');

  } catch (error) {
    console.error('Error in user-management function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
