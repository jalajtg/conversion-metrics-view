import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DedupeResult {
  success: boolean;
  duplicatesFound: number;
  duplicatesRemoved: number;
  errors: string[];
  details: Array<{
    key: string;
    duplicateCount: number;
    keptRecord: string;
    removedRecords: string[];
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

    // Authenticate user
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

    console.log('Starting deduplication process...');

    const result: DedupeResult = {
      success: true,
      duplicatesFound: 0,
      duplicatesRemoved: 0,
      errors: [],
      details: []
    };

    // Get all leads
    const { data: allLeads, error: fetchError } = await supabaseClient
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch leads',
        details: fetchError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Found ${allLeads?.length || 0} total leads`);

    if (!allLeads || allLeads.length === 0) {
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Group leads by deduplication key
    const leadGroups = new Map<string, any[]>();

    allLeads.forEach(lead => {
      // Priority: old_user_id > email > client_name+phone
      let dedupeKey = '';
      
      if (lead.old_user_id && lead.old_user_id.trim()) {
        dedupeKey = `old_id:${lead.old_user_id.trim()}`;
      } else if (lead.email && lead.email.trim()) {
        dedupeKey = `email:${lead.email.toLowerCase().trim()}`;
      } else if (lead.client_name && lead.phone) {
        dedupeKey = `name_phone:${lead.client_name.toLowerCase().trim()}:${lead.phone.trim()}`;
      } else {
        // Skip leads without sufficient identifying info
        return;
      }

      if (!leadGroups.has(dedupeKey)) {
        leadGroups.set(dedupeKey, []);
      }
      leadGroups.get(dedupeKey)!.push(lead);
    });

    console.log(`Found ${leadGroups.size} unique lead groups`);

    // Process each group with duplicates
    for (const [key, leads] of leadGroups) {
      if (leads.length <= 1) continue; // No duplicates

      console.log(`Processing ${leads.length} duplicates for key: ${key}`);
      result.duplicatesFound += leads.length - 1;

      // Sort by preference: most recent, most complete data
      leads.sort((a, b) => {
        // Priority 1: Has old_user_id
        if (a.old_user_id && !b.old_user_id) return -1;
        if (!a.old_user_id && b.old_user_id) return 1;
        
        // Priority 2: More complete data (more non-null fields)
        const aComplete = Object.values(a).filter(v => v !== null && v !== '').length;
        const bComplete = Object.values(b).filter(v => v !== null && v !== '').length;
        if (aComplete !== bComplete) return bComplete - aComplete;
        
        // Priority 3: Most recent
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      const keepLead = leads[0];
      const duplicateLeads = leads.slice(1);
      
      console.log(`Keeping lead: ${keepLead.client_name} (${keepLead.id})`);
      console.log(`Removing ${duplicateLeads.length} duplicates`);

      // Delete duplicates
      const removedIds: string[] = [];
      for (const duplicate of duplicateLeads) {
        try {
          const { error: deleteError } = await supabaseClient
            .from('leads')
            .delete()
            .eq('id', duplicate.id);

          if (deleteError) {
            result.errors.push(`Failed to delete duplicate lead ${duplicate.client_name} (${duplicate.id}): ${deleteError.message}`);
          } else {
            removedIds.push(duplicate.id);
            result.duplicatesRemoved++;
          }
        } catch (error) {
          result.errors.push(`Error deleting duplicate lead ${duplicate.client_name} (${duplicate.id}): ${error.message}`);
        }
      }

      result.details.push({
        key,
        duplicateCount: leads.length,
        keptRecord: `${keepLead.client_name} (${keepLead.id})`,
        removedRecords: removedIds
      });
    }

    result.success = result.errors.length === 0;

    console.log(`Deduplication completed: ${result.duplicatesRemoved} duplicates removed, ${result.errors.length} errors`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Deduplication error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});