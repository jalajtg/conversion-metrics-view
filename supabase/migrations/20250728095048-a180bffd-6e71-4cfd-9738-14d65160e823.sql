-- Fix remaining security issues from linter

-- Fix RLS on tables that have policies but RLS disabled
ALTER TABLE public.clinic_new ENABLE ROW LEVEL SECURITY;

-- Fix missing search_path on remaining functions
CREATE OR REPLACE FUNCTION public.user_owns_clinic(clinic_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clinics 
    WHERE id = clinic_uuid AND owner_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.create_profile(user_id uuid, user_name text, user_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, created_at, updated_at)
  VALUES (user_id, user_name, user_role, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_profile(user_id uuid, user_name text, user_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, created_at, updated_at)
  VALUES (user_id, user_name, user_role, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name,
      role = EXCLUDED.role,
      updated_at = NOW();
END;
$$;

CREATE OR REPLACE FUNCTION public.send_user_notification_email(p_user_id uuid, p_email_type text, p_clinic_name text DEFAULT NULL::text, p_password text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
  user_name text;
BEGIN
  -- Get user details
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = p_user_id;
  
  SELECT name INTO user_name
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Store email request in a table for processing by edge function
  INSERT INTO public.email_queue (
    user_id,
    email_type,
    user_email,
    user_name,
    clinic_name,
    password,
    created_at
  ) VALUES (
    p_user_id,
    p_email_type,
    user_email,
    COALESCE(user_name, 'User'),
    p_clinic_name,
    p_password,
    now()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.replicate_products_to_clinic(source_clinic_id uuid, target_clinic_id uuid)
RETURNS integer
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  products_count INTEGER := 0;
BEGIN
  -- Insert products from source clinic to target clinic
  INSERT INTO products (name, price, description, clinic_id)
  SELECT 
    name,
    price,
    description,
    target_clinic_id
  FROM products 
  WHERE clinic_id = source_clinic_id
  AND NOT EXISTS (
    -- Avoid duplicates by checking if product with same name already exists for target clinic
    SELECT 1 FROM products p2 
    WHERE p2.clinic_id = target_clinic_id 
    AND p2.name = products.name
  );
  
  GET DIAGNOSTICS products_count = ROW_COUNT;
  RETURN products_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.replicate_products_to_all_clinics(source_clinic_id uuid)
RETURNS TABLE(target_clinic_id uuid, clinic_name text, products_replicated integer)
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  clinic_record RECORD;
  replicated_count INTEGER;
BEGIN
  -- Loop through all clinics except the source clinic
  FOR clinic_record IN 
    SELECT id, name FROM clinics WHERE id != source_clinic_id
  LOOP
    -- Replicate products to this clinic
    SELECT replicate_products_to_clinic(source_clinic_id, clinic_record.id) INTO replicated_count;
    
    -- Return the result for this clinic
    target_clinic_id := clinic_record.id;
    clinic_name := clinic_record.name;
    products_replicated := replicated_count;
    RETURN NEXT;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (new.id, new.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$;