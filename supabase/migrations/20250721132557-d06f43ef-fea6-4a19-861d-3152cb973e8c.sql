
-- Add total_paid field to clinics table
ALTER TABLE public.clinics 
ADD COLUMN total_paid DECIMAL(10,2) DEFAULT 0.00;

-- Add a comment to describe the field
COMMENT ON COLUMN public.clinics.total_paid IS 'Total paid amount for this clinic, manually entered by super admin';
