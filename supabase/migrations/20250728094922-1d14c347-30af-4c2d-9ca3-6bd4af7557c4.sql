-- Phase 1: Critical Database Security Fixes

-- Fix profiles table RLS policies to prevent infinite recursion
DROP POLICY IF EXISTS "Allow super admin to perform all actions to profile table" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;

-- Create secure policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (id = auth.uid());

-- Super admins can view all profiles using a secure function
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'::app_role
  )
$$;

CREATE POLICY "Super admins can view all profiles" ON public.profiles
FOR SELECT USING (public.is_super_admin());

CREATE POLICY "Super admins can update all profiles" ON public.profiles
FOR UPDATE USING (public.is_super_admin());

CREATE POLICY "Super admins can delete all profiles" ON public.profiles
FOR DELETE USING (public.is_super_admin());

-- Secure clinic_new table or remove if not needed
-- For now, adding basic RLS since it appears to contain clinic data
ALTER TABLE public.clinic_new ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No public access to clinic_new" ON public.clinic_new
FOR ALL USING (false);

CREATE POLICY "Super admins can manage clinic_new" ON public.clinic_new
FOR ALL USING (public.is_super_admin());

-- Update existing functions to use proper search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Create secure super admin assignment function
CREATE OR REPLACE FUNCTION public.assign_super_admin_by_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only assign super admin role to specific verified emails
  -- This should be managed through a secure admin interface, not hardcoded
  IF NEW.email IN ('admin@toratech.ai', 'hellomrsatinder@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- Assign regular user role to all other users
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update the trigger to use the new function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_super_admin_by_email();