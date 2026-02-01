
-- Drop existing policy if it exists to avoid conflicts
drop policy if exists "Users can create organizations" on organizations;

-- Create a permissive policy for authenticated users to create organizations
create policy "Users can create organizations"
on organizations
for insert
to authenticated
with check (true);

-- Ensure organization_members allows users to add themselves (needed when creating an org)
drop policy if exists "Users can add themselves to organizations" on organization_members;
drop policy if exists "Users can manage members" on organization_members;

create policy "Users can manage members"
on organization_members
for insert
to authenticated
with check (
  -- User adding themselves (e.g. as owner when creating org)
  auth.uid() = user_id
  OR
  -- Existing members adding others (if they are owners - simplified check)
  exists (
    select 1 from organization_members om
    where om.organization_id = organization_members.organization_id
    and om.user_id = auth.uid()
    and om.role = 'owner'
  )
);
