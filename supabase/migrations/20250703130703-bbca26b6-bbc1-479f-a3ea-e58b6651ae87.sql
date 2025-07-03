
-- Add RLS policy for super admins to view all leads
CREATE POLICY "Super admins can view all leads" 
ON public.leads 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'::app_role
  )
);
