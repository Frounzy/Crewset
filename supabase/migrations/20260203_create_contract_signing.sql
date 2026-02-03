create table if not exists contract_sign_links (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  contract_id uuid references contracts(id) on delete cascade not null,
  token text unique not null,
  expires_at timestamp with time zone not null,
  used_at timestamp with time zone,
  signer_name text,
  signer_email text,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table contract_sign_links enable row level security;

drop policy if exists "Users can view their own sign links" on contract_sign_links;
create policy "Users can view their own sign links"
  on contract_sign_links for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own sign links" on contract_sign_links;
create policy "Users can insert their own sign links"
  on contract_sign_links for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own sign links" on contract_sign_links;
create policy "Users can update their own sign links"
  on contract_sign_links for update
  using (auth.uid() = user_id);

create table if not exists contract_audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  contract_id uuid references contracts(id) on delete cascade not null,
  sign_link_id uuid references contract_sign_links(id) on delete cascade,
  action text check (action in ('viewed', 'signed')) not null,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table contract_audit_logs enable row level security;

drop policy if exists "Users can view their own contract audit logs" on contract_audit_logs;
create policy "Users can view their own contract audit logs"
  on contract_audit_logs for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own contract audit logs" on contract_audit_logs;
create policy "Users can insert their own contract audit logs"
  on contract_audit_logs for insert
  with check (auth.uid() = user_id);
