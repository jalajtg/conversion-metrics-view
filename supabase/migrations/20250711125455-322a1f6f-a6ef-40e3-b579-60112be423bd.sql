-- Change user_id column from UUID to TEXT to accept external system IDs
ALTER TABLE public.bookings 
ALTER COLUMN user_id TYPE TEXT;