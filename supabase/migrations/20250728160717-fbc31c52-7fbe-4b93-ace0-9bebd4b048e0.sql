-- Fix the search path for the function
CREATE OR REPLACE FUNCTION public.update_new_patients_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;