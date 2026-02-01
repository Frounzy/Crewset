-- 1. Go to Supabase Dashboard -> Authentication -> Users
-- 2. Find your user and copy the "User UID"
-- 3. Replace 'PASTE_USER_UUID_HERE' below with that ID
-- 4. Run this script in the SQL Editor

INSERT INTO subscriptions (user_id, plan, status, current_period_end)
VALUES (
    'PASTE_USER_UUID_HERE', -- e.g. 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
    'pro', 
    'active', 
    now() + interval '1 year'
)
ON CONFLICT (user_id) DO UPDATE
SET 
    plan = 'pro', 
    status = 'active', 
    current_period_end = now() + interval '1 year';
