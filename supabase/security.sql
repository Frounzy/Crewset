-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
-- Assuming a 'teams' or 'organizations' table exists, enable RLS there too
-- ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- 1. CLIENTS POLICIES
CREATE POLICY "Users can view their own clients" 
ON clients FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients" 
ON clients FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" 
ON clients FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" 
ON clients FOR DELETE 
USING (auth.uid() = user_id);

-- 2. CONTRACTS POLICIES
CREATE POLICY "Users can view their own contracts" 
ON contracts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contracts" 
ON contracts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contracts" 
ON contracts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contracts" 
ON contracts FOR DELETE 
USING (auth.uid() = user_id);

-- 3. SUBSCRIPTIONS POLICIES
-- Users should read their own subscription to know their plan
CREATE POLICY "Users can view their own subscription" 
ON subscriptions FOR SELECT 
USING (auth.uid() = user_id);

-- Only Service Role (Stripe Webhook) should insert/update subscriptions
-- But if we use supabase-admin in webhook, it bypasses RLS.
-- So we can strictly deny other operations for normal users.
CREATE POLICY "Users cannot modify subscriptions" 
ON subscriptions FOR INSERT 
WITH CHECK (false);

CREATE POLICY "Users cannot update subscriptions" 
ON subscriptions FOR UPDATE 
USING (false);

CREATE POLICY "Users cannot delete subscriptions" 
ON subscriptions FOR DELETE 
USING (false);

-- 4. STORAGE POLICIES (Example for 'documents' bucket)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- CREATE POLICY "Users can upload their own documents"
-- ON storage.objects FOR INSERT
-- WITH CHECK ( bucket_id = 'documents' AND auth.uid() = owner );

-- CREATE POLICY "Users can view their own documents"
-- ON storage.objects FOR SELECT
-- USING ( bucket_id = 'documents' AND auth.uid() = owner );
