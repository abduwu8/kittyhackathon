-- Run in Supabase SQL editor after 001_create_profiles.sql

create table if not exists public.litter_tracking (
  id uuid primary key default gen_random_uuid(),
  cat_id uuid not null references public.profiles (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  litter_box_type text not null,
  litter_type text not null,
  number_of_boxes integer not null check (number_of_boxes >= 1),
  last_cleaned_at timestamptz not null,
  cleaning_frequency text not null,
  urine_observation text not null,
  stool_observation text not null,
  abnormal_behavior boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cat_medications (
  id uuid primary key default gen_random_uuid(),
  cat_id uuid not null references public.profiles (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  purpose text not null,
  dosage numeric not null check (dosage > 0),
  unit text not null,
  frequency text not null,
  start_date date not null,
  end_date date,
  times_to_give text[] not null default '{}',
  with_food boolean not null default true,
  status text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.litter_tracking enable row level security;
alter table public.cat_medications enable row level security;

create policy "Users can manage own litter tracking"
  on public.litter_tracking
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage own cat medications"
  on public.cat_medications
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists litter_tracking_cat_id_idx on public.litter_tracking (cat_id);
create index if not exists cat_medications_cat_id_idx on public.cat_medications (cat_id);
create index if not exists cat_medications_status_idx on public.cat_medications (status);
