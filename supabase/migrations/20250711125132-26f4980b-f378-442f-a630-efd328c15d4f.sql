-- Add a unique constraint on the combination of name, email, and phone for bookings
-- This will allow proper upsert functionality based on these three fields
ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_name_email_phone_unique 
UNIQUE (name, email, phone);