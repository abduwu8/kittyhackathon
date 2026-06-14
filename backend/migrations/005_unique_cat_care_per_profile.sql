-- Ensures one litter and feeding record per profile (cat_id = profile id).

create unique index if not exists litter_tracking_cat_id_unique
  on public.litter_tracking (cat_id);

create unique index if not exists feeding_schedules_cat_id_unique
  on public.feeding_schedules (cat_id);
