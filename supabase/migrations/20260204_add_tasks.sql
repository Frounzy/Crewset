 -- TASKS TABLE
 create table if not exists tasks (
   id uuid default uuid_generate_v4() primary key,
   organization_id uuid references organizations(id) on delete cascade not null,
   user_id uuid references profiles(id) on delete cascade not null,
   contract_id uuid references contracts(id) on delete set null,
   title text not null,
   description text,
   assignee_id uuid references profiles(id) on delete set null,
   due_date date not null,
   status text check (status in ('open','completed')) not null default 'open',
   created_at timestamp with time zone default timezone('utc'::text, now()) not null,
   updated_at timestamp with time zone default timezone('utc'::text, now()) not null
 );
 
 alter table tasks enable row level security;
 
 create index if not exists tasks_org_idx on tasks(organization_id);
 create index if not exists tasks_assignee_idx on tasks(assignee_id);
 create index if not exists tasks_due_idx on tasks(due_date);
 
 -- RLS: Org members can view/insert/update tasks within their organization
 create policy "Org members can view tasks" on tasks
   for select using (
     organization_id in (
       select organization_id from organization_members where user_id = auth.uid()
     )
   );
 
 create policy "Org members can insert tasks" on tasks
   for insert with check (
     organization_id in (
       select organization_id from organization_members where user_id = auth.uid()
     )
   );
 
 create policy "Org members can update tasks" on tasks
   for update using (
     organization_id in (
       select organization_id from organization_members where user_id = auth.uid()
     )
   );
 
 create policy "Org members can delete tasks" on tasks
   for delete using (
     organization_id in (
       select organization_id from organization_members where user_id = auth.uid()
     )
   );
 
 -- TASK ACTIVITIES TABLE
 create table if not exists task_activities (
   id uuid default uuid_generate_v4() primary key,
   organization_id uuid references organizations(id) on delete cascade not null,
   task_id uuid references tasks(id) on delete cascade not null,
   actor_id uuid references profiles(id) on delete set null,
   action text check (action in ('task_created','task_assigned','task_completed')) not null,
   details jsonb,
   created_at timestamp with time zone default timezone('utc'::text, now()) not null
 );
 
 alter table task_activities enable row level security;
 
 create index if not exists task_activities_org_idx on task_activities(organization_id);
 create index if not exists task_activities_task_idx on task_activities(task_id);
 create index if not exists task_activities_created_idx on task_activities(created_at desc);
 
 create policy "Org members can view task activities" on task_activities
   for select using (
     organization_id in (
       select organization_id from organization_members where user_id = auth.uid()
     )
   );
 
 create policy "Org members can insert task activities" on task_activities
   for insert with check (
     organization_id in (
       select organization_id from organization_members where user_id = auth.uid()
     )
   );
 
