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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Received request:', req.method);

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed. Use POST.' }), 
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const bookingData: BookingData = await req.json();
    console.log('Received booking data:', bookingData);

    // Validate required fields
    if (!bookingData.name || !bookingData.booking_time) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields. Name and booking_time are required.' 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate booking_time is a valid date
    const bookingTime = new Date(bookingData.booking_time);
    if (isNaN(bookingTime.getTime())) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid booking_time format. Please use ISO 8601 format.' 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare booking data for insertion
    const bookingToInsert = {
      name: bookingData.name.trim(),
      email: bookingData.email?.trim() || null,
      phone: bookingData.phone?.trim() || null,
      booking_time: bookingData.booking_time,
      clinic_id: bookingData.clinic_id || null,
      product_id: bookingData.product_id || null,
      created_at: new Date().toISOString()
    };

    console.log('Inserting booking:', bookingToInsert);

    // Insert booking into database
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingToInsert])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create booking', 
          details: error.message 
        }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Booking created successfully:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        booking: data,
        message: 'Booking created successfully' 
      }), 
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in add-booking function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});