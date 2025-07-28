-- Create new patients tracking table
CREATE TABLE public.new_patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
  count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(clinic_id, month, year)
);

-- Enable Row Level Security
ALTER TABLE public.new_patients ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their clinic new patients data" 
ON public.new_patients 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.clinics 
    WHERE clinics.id = new_patients.clinic_id 
    AND clinics.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can create new patients data for their clinics" 
ON public.new_patients 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clinics 
    WHERE clinics.id = new_patients.clinic_id 
    AND clinics.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can update their clinic new patients data" 
ON public.new_patients 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.clinics 
    WHERE clinics.id = new_patients.clinic_id 
    AND clinics.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their clinic new patients data" 
ON public.new_patients 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.clinics 
    WHERE clinics.id = new_patients.clinic_id 
    AND clinics.owner_id = auth.uid()
  )
);

-- Super admin policies
CREATE POLICY "Super admins can manage all new patients data" 
ON public.new_patients 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'super_admin'::app_role
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_new_patients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_new_patients_updated_at
  BEFORE UPDATE ON public.new_patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_new_patients_updated_at();