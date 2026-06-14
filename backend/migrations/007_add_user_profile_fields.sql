alter table public.profiles
  add column if not exists user_name text,
  add column if not exists favorite_cat_breed text;
