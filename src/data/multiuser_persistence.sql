-- Run this in Supabase SQL Editor after seed_recetas.sql

create table user_substitutions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  day text not null,
  momento_id bigint references momentos_dia(id) on delete cascade,
  original_ingredient_id bigint references alimentos(id) on delete cascade,
  substitute_ingredient_id bigint references alimentos(id) on delete cascade,
  unique (day, momento_id, original_ingredient_id)
);

alter table user_substitutions enable row level security;
create policy "public_all" on user_substitutions for all using (true) with check (true);

create table completed_meals (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  momento_id bigint references momentos_dia(id) on delete cascade,
  unique (date, momento_id)
);

alter table completed_meals enable row level security;
create policy "public_all" on completed_meals for all using (true) with check (true);
