-- Run in Supabase SQL editor after 002_create_cat_care_tables.sql

create table if not exists public.cat_vaccinations (
  id uuid primary key default gen_random_uuid(),
  cat_id uuid not null references public.profiles (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  vaccine_name text not null,
  date_given date not null,
  next_due_date date not null,
  vet_clinic_name text not null,
  batch_or_certificate_number text,
  proof_document_name text,
  proof_document_uri text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cat_vaccinations_due_after_given check (next_due_date >= date_given)
);

create table if not exists public.feeding_schedules (
  id uuid primary key default gen_random_uuid(),
  cat_id uuid not null references public.profiles (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  feeding_mode text not null,
  food_type text not null,
  brand text not null,
  food_format text not null,
  portion_size numeric,
  portion_unit text,
  feeding_times text[] not null default '{}',
  treat_notes text,
  water_intake_notes text,
  dietary_restrictions text,
  special_instructions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cat_vaccinations enable row level security;
alter table public.feeding_schedules enable row level security;

create policy "Users can manage own cat vaccinations"
  on public.cat_vaccinations
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage own feeding schedules"
  on public.feeding_schedules
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists cat_vaccinations_cat_id_idx on public.cat_vaccinations (cat_id);
create index if not exists cat_vaccinations_next_due_idx on public.cat_vaccinations (next_due_date);
create index if not exists feeding_schedules_cat_id_idx on public.feeding_schedules (cat_id);
