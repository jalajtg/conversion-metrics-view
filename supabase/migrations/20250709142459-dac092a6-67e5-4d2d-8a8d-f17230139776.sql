-- Add unique constraint for old_user_id to prevent duplicates
ALTER TABLE leads ADD CONSTRAINT unique_old_user_id UNIQUE (old_user_id);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (email) WHERE email IS NOT NULL;

-- Create index for faster phone lookups  
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads (phone) WHERE phone IS NOT NULL;

-- Create index for faster name lookups
CREATE INDEX IF NOT EXISTS idx_leads_client_name ON leads (client_name) WHERE client_name IS NOT NULL;