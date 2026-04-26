create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  target_role text,
  skills text[],
  skill_score int default 0,
  streak int default 0,
  created_at timestamp default now()
);

create table if not exists public.skill_gap_reports (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  target_role text,
  strengths text[],
  missing_skills text[],
  project_suggestions text[],
  recommended_roadmap text[],
  created_at timestamp default now()
);

create table if not exists public.mood_history (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  mood text,
  created_at timestamp default now()
);

create table if not exists public.daily_tasks (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  task_batch_id text,
  title text,
  description text,
  category text,
  difficulty text,
  estimated_time text,
  reason text,
  completed boolean default false,
  created_at timestamp default now()
);

alter table public.daily_tasks
add column if not exists task_batch_id text;

create table if not exists public.interview_messages (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  target_role text,
  user_message text,
  ai_reply text,
  feedback text,
  score int,
  improvement_tip text,
  created_at timestamp default now()
);

create table if not exists public.progress (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade unique,
  tasks_completed int default 0,
  interviews_completed int default 0,
  completion_rate int default 0,
  readiness_score int default 0,
  readiness_reason text default '',
  readiness_skills_signature text default '',
  updated_at timestamp default now()
);

alter table public.progress
add column if not exists readiness_score int default 0;

alter table public.progress
add column if not exists readiness_reason text default '';

alter table public.progress
add column if not exists readiness_skills_signature text default '';

alter table public.profiles enable row level security;
alter table public.skill_gap_reports enable row level security;
alter table public.mood_history enable row level security;
alter table public.daily_tasks enable row level security;
alter table public.interview_messages enable row level security;
alter table public.progress enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can read own skill reports" on public.skill_gap_reports;
drop policy if exists "Users can insert own skill reports" on public.skill_gap_reports;
drop policy if exists "Users can read own mood history" on public.mood_history;
drop policy if exists "Users can insert own mood history" on public.mood_history;
drop policy if exists "Users can read own daily tasks" on public.daily_tasks;
drop policy if exists "Users can insert own daily tasks" on public.daily_tasks;
drop policy if exists "Users can update own daily tasks" on public.daily_tasks;
drop policy if exists "Users can read own interview messages" on public.interview_messages;
drop policy if exists "Users can insert own interview messages" on public.interview_messages;
drop policy if exists "Users can read own progress" on public.progress;
drop policy if exists "Users can insert own progress" on public.progress;
drop policy if exists "Users can update own progress" on public.progress;

create policy "Users can read own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can read own skill reports"
on public.skill_gap_reports for select
using (auth.uid() = user_id);

create policy "Users can insert own skill reports"
on public.skill_gap_reports for insert
with check (auth.uid() = user_id);

create policy "Users can read own mood history"
on public.mood_history for select
using (auth.uid() = user_id);

create policy "Users can insert own mood history"
on public.mood_history for insert
with check (auth.uid() = user_id);

create policy "Users can read own daily tasks"
on public.daily_tasks for select
using (auth.uid() = user_id);

create policy "Users can insert own daily tasks"
on public.daily_tasks for insert
with check (auth.uid() = user_id);

create policy "Users can update own daily tasks"
on public.daily_tasks for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can read own interview messages"
on public.interview_messages for select
using (auth.uid() = user_id);

create policy "Users can insert own interview messages"
on public.interview_messages for insert
with check (auth.uid() = user_id);

create policy "Users can read own progress"
on public.progress for select
using (auth.uid() = user_id);

create policy "Users can insert own progress"
on public.progress for insert
with check (auth.uid() = user_id);

create policy "Users can update own progress"
on public.progress for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
