
-- Create helper function to check organization membership
-- This function is SECURITY DEFINER to bypass RLS on organization_members when called from organizations RLS
create or replace function public.is_org_member(_org_id uuid, _user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from organization_members
    where organization_id = _org_id
    and user_id = _user_id
  );
$$;

-- Optimize organizations select policy to use the security definer function directly
-- This prevents potential RLS recursion issues and improves performance

drop policy if exists "Users can view organizations they belong to" on organizations;

create policy "Users can view organizations they belong to" on organizations
  for select using (
    public.is_org_member(id, auth.uid())
  );
