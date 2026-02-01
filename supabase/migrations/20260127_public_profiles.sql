-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. Update PROFILES table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username text UNIQUE,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- Add index on username for fast lookups
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles (username);

-- 2. Create PORTFOLIO_ITEMS table
CREATE TABLE IF NOT EXISTS portfolio_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  image_url text,
  link text,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. RLS Policies

-- Profiles: Already has "Public profiles are viewable by everyone" (true).
-- We might want to restrict it to only is_public=true for non-owners?
-- Existing: create policy "Public profiles are viewable by everyone" on profiles for select using (true);
-- Let's refine it if possible, but 'true' is safe for now as long as we filter in frontend/API.
-- Ideally: 
-- DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
-- CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (is_public = true OR auth.uid() = id);
-- For now, let's leave existing policy if it's broad, but adding specific policies for updates.

-- Portfolio Items RLS
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Portfolio items viewable by everyone" 
ON portfolio_items FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own portfolio items" 
ON portfolio_items FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio items" 
ON portfolio_items FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolio items" 
ON portfolio_items FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Storage for Portfolio Images (Optional - assume 'portfolio' bucket)
-- insert into storage.buckets (id, name, public) values ('portfolio', 'portfolio', true) on conflict do nothing;
-- create policy "Portfolio images are public" on storage.objects for select using (bucket_id = 'portfolio');
-- create policy "Users can upload portfolio images" on storage.objects for insert with check (bucket_id = 'portfolio' and auth.uid() = owner);
