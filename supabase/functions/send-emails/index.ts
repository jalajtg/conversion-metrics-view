
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailQueueItem {
  id: string;
  user_id: string;
  email_type: string;
  user_email: string;
  user_name: string;
  clinic_name?: string;
  password?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing email queue...');

    // Get unprocessed emails from the queue
    const { data: emails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('processed', false)
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchError) {
      console.error('Error fetching emails:', fetchError);
      throw fetchError;
    }

    if (!emails || emails.length === 0) {
      console.log('No emails to process');
      return new Response(
        JSON.stringify({ message: 'No emails to process' }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log(`Processing ${emails.length} emails`);

    // Process each email
    for (const email of emails as EmailQueueItem[]) {
      try {
        let subject = '';
        let htmlContent = '';

        if (email.email_type === 'new_user') {
          subject = 'Welcome! Your account has been created';
          htmlContent = `
            <h1>Welcome to the platform, ${email.user_name}!</h1>
            <p>Your account has been created successfully.</p>
            <p><strong>Login Details:</strong></p>
            <p>Email: ${email.user_email}</p>
            <p>Temporary Password: ${email.password}</p>
            <p>Please change your password after your first login.</p>
            <p>Best regards,<br>The Admin Team</p>
          `;
        } else if (email.email_type === 'clinic_added') {
          subject = `You've been added to ${email.clinic_name}`;
          htmlContent = `
            <h1>Hello ${email.user_name},</h1>
            <p>You have been assigned as the owner of <strong>${email.clinic_name}</strong>.</p>
            <p>You can now access and manage this clinic through your dashboard.</p>
            <p>Best regards,<br>The Admin Team</p>
          `;
        }

        // Log the email that would be sent (replace with actual email service)
        console.log(`Would send email to ${email.user_email}:`);
        console.log(`Subject: ${subject}`);
        console.log(`Content: ${htmlContent}`);

        // TODO: Replace this with actual email sending service (e.g., Resend)
        // For now, we'll just mark as processed

        // Mark email as processed
        const { error: updateError } = await supabase
          .from('email_queue')
          .update({ processed: true })
          .eq('id', email.id);

        if (updateError) {
          console.error(`Error marking email ${email.id} as processed:`, updateError);
        } else {
          console.log(`Successfully processed email ${email.id}`);
        }

      } catch (emailError) {
        console.error(`Error processing email ${email.id}:`, emailError);
        // Continue with other emails even if one fails
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed ${emails.length} emails`,
        processed: emails.length 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('Error in send-emails function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
