-- Remove the total_paid column from the clinics table
ALTER TABLE public.clinics DROP COLUMN IF EXISTS total_paid;