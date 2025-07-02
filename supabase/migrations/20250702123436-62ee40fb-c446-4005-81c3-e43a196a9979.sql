
-- Add month column to clinic_product_categories table to support monthly pricing
ALTER TABLE public.clinic_product_categories 
ADD COLUMN month INTEGER CHECK (month >= 1 AND month <= 12);

-- Update the unique constraint to include month, allowing multiple entries per clinic/category/month
ALTER TABLE public.clinic_product_categories 
DROP CONSTRAINT IF EXISTS clinic_product_categories_clinic_id_product_category_id_key;

-- Add new unique constraint that includes month
ALTER TABLE public.clinic_product_categories 
ADD CONSTRAINT clinic_product_categories_clinic_id_product_category_id_month_key 
UNIQUE (clinic_id, product_category_id, month);

-- Update existing records to have month = 1 (January) as default
UPDATE public.clinic_product_categories 
SET month = 1 
WHERE month IS NULL;

-- Make month column NOT NULL after setting default values
ALTER TABLE public.clinic_product_categories 
ALTER COLUMN month SET NOT NULL;
