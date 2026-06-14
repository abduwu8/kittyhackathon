-- Run in Supabase SQL editor after prior migrations.

create table if not exists public.cat_photos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.cat_photos enable row level security;

create policy "Users can manage own cat photos"
  on public.cat_photos
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists cat_photos_profile_id_idx on public.cat_photos (profile_id);
create index if not exists cat_photos_sort_order_idx on public.cat_photos (profile_id, sort_order);

-- Storage bucket (run once in Supabase dashboard or SQL editor)
insert into storage.buckets (id, name, public)
values ('cat-photos', 'cat-photos', true)
on conflict (id) do nothing;

create policy "Users can upload own cat photos"
  on storage.objects
  for insert
  with check (
    bucket_id = 'cat-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own cat photos"
  on storage.objects
  for select
  using (
    bucket_id = 'cat-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own cat photos"
  on storage.objects
  for delete
  using (
    bucket_id = 'cat-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
