-- First, let's remove duplicates and keep only the most recent record for each old_user_id
WITH ranked_leads AS (
  SELECT id, 
         old_user_id,
         ROW_NUMBER() OVER (
           PARTITION BY old_user_id 
           ORDER BY created_at DESC, 
                    (CASE WHEN email IS NOT NULL THEN 1 ELSE 0 END) DESC,
                    (CASE WHEN phone IS NOT NULL THEN 1 ELSE 0 END) DESC
         ) as rn
  FROM leads 
  WHERE old_user_id IS NOT NULL
),
duplicates_to_delete AS (
  SELECT id FROM ranked_leads WHERE rn > 1
)
DELETE FROM leads WHERE id IN (SELECT id FROM duplicates_to_delete);

-- Now add the unique constraint
ALTER TABLE leads ADD CONSTRAINT unique_old_user_id UNIQUE (old_user_id);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads (phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_client_name ON leads (client_name) WHERE client_name IS NOT NULL;