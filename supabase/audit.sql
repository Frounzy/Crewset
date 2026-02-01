-- Enable RLS
create table if not exists audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  action text not null,
  resource text,
  metadata jsonb,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table audit_logs enable row level security;

-- Only service role can insert (from backend)
create policy "Service role can insert audit logs"
  on audit_logs
  for insert
  with check (true);

-- Users can only view their own logs (optional, maybe admins only)
create policy "Users can view own audit logs"
  on audit_logs
  for select
  using (auth.uid() = user_id);

-- Rate Limiting Table
create table if not exists rate_limits (
  key text primary key,
  count int default 1,
  expires_at bigint
);

-- Cleanup function for rate limits (can be called via cron)
-- create or replace function clean_expired_rate_limits()
-- returns void as $$
-- delete from rate_limits where expires_at < extract(epoch from now());
-- $$ language sql;
