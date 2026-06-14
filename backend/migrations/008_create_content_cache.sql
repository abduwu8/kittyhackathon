-- Optional content cache tables for the Go API (server-side persistence).
-- Run in Supabase SQL editor if you want cold-start hydration from Postgres.

create table if not exists public.content_cat_facts (
  id uuid primary key default gen_random_uuid(),
  fact_text text not null,
  fact_length integer not null default 0,
  synced_at timestamptz not null default now(),
  unique (fact_text)
);

create table if not exists public.content_cat_breeds (
  id uuid primary key default gen_random_uuid(),
  breed text not null,
  country text not null default '',
  origin text not null default '',
  coat text not null default '',
  pattern text not null default '',
  synced_at timestamptz not null default now(),
  unique (breed)
);

create table if not exists public.content_cat_images (
  id text primary key,
  image_url text not null,
  width integer not null default 0,
  height integer not null default 0,
  breed_name text not null default '',
  synced_at timestamptz not null default now()
);

create index if not exists content_cat_images_synced_at_idx
  on public.content_cat_images (synced_at desc);

alter table public.content_cat_facts enable row level security;
alter table public.content_cat_breeds enable row level security;
alter table public.content_cat_images enable row level security;

create policy "content facts are readable by everyone"
  on public.content_cat_facts for select using (true);

create policy "content breeds are readable by everyone"
  on public.content_cat_breeds for select using (true);

create policy "content images are readable by everyone"
  on public.content_cat_images for select using (true);
