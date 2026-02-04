create table if not exists client_feedback_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  client_id uuid references clients(id) on delete cascade not null,
  token text unique not null,
  expires_at timestamp with time zone not null,
  used_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table client_feedback_requests enable row level security;

drop policy if exists "Users can view own feedback requests" on client_feedback_requests;
create policy "Users can view own feedback requests"
  on client_feedback_requests for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own feedback requests" on client_feedback_requests;
create policy "Users can insert own feedback requests"
  on client_feedback_requests for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own feedback requests" on client_feedback_requests;
create policy "Users can update own feedback requests"
  on client_feedback_requests for update
  using (auth.uid() = user_id);

create table if not exists client_feedbacks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  client_id uuid references clients(id) on delete cascade not null,
  request_id uuid references client_feedback_requests(id) on delete set null,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  published boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table client_feedbacks enable row level security;

drop policy if exists "Users can view own feedbacks" on client_feedbacks;
create policy "Users can view own feedbacks"
  on client_feedbacks for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own feedbacks" on client_feedbacks;
create policy "Users can insert own feedbacks"
  on client_feedbacks for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own feedbacks" on client_feedbacks;
create policy "Users can update own feedbacks"
  on client_feedbacks for update
  using (auth.uid() = user_id);
