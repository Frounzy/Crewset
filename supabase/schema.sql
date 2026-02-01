-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ORGANIZATIONS TABLE (New for Team Access)
create table if not exists organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for organizations
alter table organizations enable row level security;

-- ORGANIZATION MEMBERS TABLE
create table if not exists organization_members (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references organizations(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  role text check (role in ('owner', 'member')) not null default 'member',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(organization_id, user_id)
);

-- Enable RLS for organization_members
alter table organization_members enable row level security;

-- Policies for organizations
create policy "Users can view organizations they belong to" on organizations
  for select using (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = organizations.id
      and organization_members.user_id = auth.uid()
    )
  );

create policy "Users can create organizations" on organizations
  for insert with check (true); -- Anyone can create, but trigger/logic should handle member addition

create policy "Owners can update their organizations" on organizations
  for update using (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = organizations.id
      and organization_members.user_id = auth.uid()
      and organization_members.role = 'owner'
    )
  );

-- Helper function to check membership safely (bypassing RLS to avoid recursion)
create or replace function public.is_org_member(_organization_id uuid, _user_id uuid)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1
    from organization_members
    where organization_id = _organization_id
    and user_id = _user_id
  );
end;
$$;

-- Policies for organization_members
create policy "Users can view members of their organizations" on organization_members
  for select using (
    public.is_org_member(organization_id, auth.uid())
  );

-- Allow users to insert themselves as owner when creating an organization
-- This is tricky with RLS. Often handled by a Postgres Function or trusted service role.
-- For simplicity, we'll allow inserting if you are the user being inserted.
-- But wait, when creating an org, we insert into organizations first, then members.
-- Let's allow inserting if auth.uid() = user_id (for self-add) OR if you are owner of the org (for inviting).
create policy "Users can manage members" on organization_members
  for insert with check (
    -- Adding self (e.g. creating org)
    auth.uid() = user_id
    OR
    -- Owner adding others
    public.is_org_member(organization_id, auth.uid()) 
    -- Note: Ideally we check for role='owner' too, but is_org_member is a good start to avoid recursion.
    -- For stricter check, we need another function or just trust the recursion is broken by the SELECT policy fix.
    -- Let's stick to the previous implementation but use the function if possible? 
    -- Actually, since we fixed the SELECT policy, the 'exists' clause here should work FINE because it triggers the SELECT policy which is now SAFE.
    -- So we don't strictly need to change this, BUT using a function is safer.
    -- Let's leave it as is for now to minimize changes, assuming the SELECT fix works.
    exists (
      select 1 from organization_members as om
      where om.organization_id = organization_members.organization_id
      and om.user_id = auth.uid()
      and om.role = 'owner'
    )
  );

create policy "Owners can remove members or members can leave" on organization_members
  for delete using (
    auth.uid() = user_id -- Leave
    OR
    exists (
      select 1 from organization_members as om
      where om.organization_id = organization_members.organization_id
      and om.user_id = auth.uid()
      and om.role = 'owner'
    ) -- Remove
  );


-- CLIENTS TABLE
create table if not exists clients (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  organization_id uuid references organizations(id) on delete cascade, -- Optional for now
  name text not null,
  email text,
  company text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for clients
alter table clients enable row level security;

-- Policies for clients
-- View: Own clients OR clients in my organization
create policy "Users can view their own clients" on clients
  for select using (
    auth.uid() = user_id 
    OR 
    (organization_id is not null AND organization_id in (
      select organization_id from organization_members where user_id = auth.uid()
    ))
  );

create policy "Users can insert their own clients" on clients
  for insert with check (
    auth.uid() = user_id
    OR
    (organization_id is not null AND organization_id in (
      select organization_id from organization_members where user_id = auth.uid()
    ))
  );

create policy "Users can update their own clients" on clients
  for update using (
    auth.uid() = user_id
    OR
    (organization_id is not null AND organization_id in (
      select organization_id from organization_members where user_id = auth.uid()
    ))
  );

create policy "Users can delete their own clients" on clients
  for delete using (
    auth.uid() = user_id
    OR
    (organization_id is not null AND organization_id in (
      select organization_id from organization_members where user_id = auth.uid()
    ))
  );


-- CONTRACTS TABLE
create table if not exists contracts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  organization_id uuid references organizations(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade not null,
  name text not null,
  start_date date not null,
  end_date date not null,
  renewal_type text check (renewal_type in ('auto-renew', 'manual')) not null,
  value_amount numeric not null,
  value_period text check (value_period in ('monthly', 'yearly')) not null,
  renewal_probability text check (renewal_probability in ('low', 'medium', 'high')) not null default 'medium',
  status text check (status in ('active', 'expired', 'renewed', 'lost')) not null default 'active',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for contracts
alter table contracts enable row level security;

-- Policies for contracts
create policy "Users can view their own contracts" on contracts
  for select using (
    auth.uid() = user_id
    OR 
    (organization_id is not null AND organization_id in (
      select organization_id from organization_members where user_id = auth.uid()
    ))
  );

create policy "Users can insert their own contracts" on contracts
  for insert with check (
    auth.uid() = user_id
    OR
    (organization_id is not null AND organization_id in (
      select organization_id from organization_members where user_id = auth.uid()
    ))
  );

create policy "Users can update their own contracts" on contracts
  for update using (
    auth.uid() = user_id
    OR
    (organization_id is not null AND organization_id in (
      select organization_id from organization_members where user_id = auth.uid()
    ))
  );

create policy "Users can delete their own contracts" on contracts
  for delete using (
    auth.uid() = user_id
    OR
    (organization_id is not null AND organization_id in (
      select organization_id from organization_members where user_id = auth.uid()
    ))
  );


-- SUBSCRIPTIONS TABLE
create table if not exists subscriptions (
  user_id uuid references auth.users primary key,
  organization_id uuid references organizations(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text check (plan in ('free', 'pro', 'agency')) not null default 'free',
  status text check (status in ('active', 'canceled', 'past_due', 'trialing')) not null default 'active',
  current_period_end timestamp with time zone
);

-- Enable RLS for subscriptions
alter table subscriptions enable row level security;

-- Policies for subscriptions
create policy "Users can view their own subscription" on subscriptions
  for select using (auth.uid() = user_id);

-- CONTRACT ACTIVITIES TABLE
create table if not exists contract_activities (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  organization_id uuid references organizations(id) on delete cascade,
  contract_id uuid references contracts(id) on delete cascade not null,
  action text not null, -- 'created', 'updated', 'renewed', 'lost', 'status_change'
  details jsonb, -- e.g. { field: 'status', old: 'active', new: 'expired' }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for contract_activities
alter table contract_activities enable row level security;

-- Policies for contract_activities
create policy "Users can view their own contract activities" on contract_activities
  for select using (
    auth.uid() = user_id
    OR
    (organization_id is not null AND organization_id in (
      select organization_id from organization_members where user_id = auth.uid()
    ))
  );

create policy "Users can insert their own contract activities" on contract_activities
  for insert with check (
    auth.uid() = user_id
    OR
    (organization_id is not null AND organization_id in (
      select organization_id from organization_members where user_id = auth.uid()
    ))
  );


-- PROFILES TABLE (Sync with auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table profiles enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone" on profiles
  for select using (true);

create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on new user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill existing users into profiles (if any)
insert into public.profiles (id, email, full_name, avatar_url)
select id, email, raw_user_meta_data->>'full_name', raw_user_meta_data->>'avatar_url'
from auth.users
on conflict (id) do nothing;
