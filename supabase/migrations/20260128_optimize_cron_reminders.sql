-- Add timezone and notification settings to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS notification_settings jsonb DEFAULT '{"email_enabled": true}';

-- Index for efficient querying of active contracts by date
CREATE INDEX IF NOT EXISTS idx_contracts_end_date_status 
ON contracts(end_date, status);

-- Index for checking if reminders were already sent
CREATE INDEX IF NOT EXISTS idx_contract_activities_lookup 
ON contract_activities(contract_id, action);

-- Optional: Create a composite index on contract_activities for faster JSONB filtering if needed
-- CREATE INDEX IF NOT EXISTS idx_contract_activities_details ON contract_activities USING gin (details);
