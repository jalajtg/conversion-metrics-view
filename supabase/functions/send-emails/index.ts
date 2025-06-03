
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
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #333; text-align: center;">Welcome to the platform, ${email.user_name}!</h1>
              <p style="font-size: 16px; line-height: 1.6;">Your account has been created successfully by an administrator.</p>
              
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="color: #333; margin-top: 0;">Your Login Details:</h2>
                <p><strong>Email:</strong> ${email.user_email}</p>
                <p><strong>Temporary Password:</strong> <code style="background-color: #e8e8e8; padding: 4px 8px; border-radius: 4px;">${email.password}</code></p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://conversion-metrics-view.lovable.app/auth" 
                   style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Login to Your Account
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                <strong>Important:</strong> Please change your password after your first login for security purposes.
              </p>
              
              <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>The Admin Team</strong>
              </p>
            </div>
          `;
        } else if (email.email_type === 'clinic_added') {
          subject = `You've been assigned to ${email.clinic_name}`;
          htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #333; text-align: center;">Hello ${email.user_name},</h1>
              <p style="font-size: 16px; line-height: 1.6;">
                You have been assigned as the owner of <strong>${email.clinic_name}</strong>.
              </p>
              <p style="font-size: 16px; line-height: 1.6;">
                You can now access and manage this clinic through your dashboard.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://conversion-metrics-view.lovable.app/auth" 
                   style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Access Your Dashboard
                </a>
              </div>
              
              <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>The Admin Team</strong>
              </p>
            </div>
          `;
        }

        // Log the email that would be sent (replace with actual email service)
        console.log(`Would send email to ${email.user_email}:`);
        console.log(`Subject: ${subject}`);
        console.log(`Content: ${htmlContent.substring(0, 200)}...`);

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
