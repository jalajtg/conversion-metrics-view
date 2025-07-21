-- Create a table for monthly clinic payments
CREATE TABLE public.clinic_monthly_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  amount NUMERIC NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(clinic_id, month, year)
);

-- Enable Row Level Security
ALTER TABLE public.clinic_monthly_payments ENABLE ROW LEVEL SECURITY;

-- Create policies for clinic monthly payments
CREATE POLICY "Super admins can manage all clinic monthly payments" 
ON public.clinic_monthly_payments 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'super_admin'::app_role
))
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'super_admin'::app_role
));

CREATE POLICY "Users can view their clinic monthly payments" 
ON public.clinic_monthly_payments 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM clinics 
  WHERE clinics.id = clinic_monthly_payments.clinic_id AND clinics.owner_id = auth.uid()
));

CREATE POLICY "Users can create their clinic monthly payments" 
ON public.clinic_monthly_payments 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM clinics 
  WHERE clinics.id = clinic_monthly_payments.clinic_id AND clinics.owner_id = auth.uid()
));

CREATE POLICY "Users can update their clinic monthly payments" 
ON public.clinic_monthly_payments 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM clinics 
  WHERE clinics.id = clinic_monthly_payments.clinic_id AND clinics.owner_id = auth.uid()
));

CREATE POLICY "Users can delete their clinic monthly payments" 
ON public.clinic_monthly_payments 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM clinics 
  WHERE clinics.id = clinic_monthly_payments.clinic_id AND clinics.owner_id = auth.uid()
));