-- 1. Create Categories Table
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_at timestamptz default now()
);

-- 2. Enable RLS on Categories
alter table public.categories enable row level security;

-- 3. Add RLS Policies for Categories
create policy "Public can read categories" on categories for select using (true);
create policy "Admins can manage categories" on categories for all 
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- 4. Initial categories seeding (from existing enum)
insert into public.categories (name)
values ('MMA'), ('Jiu-Jitsu'), ('Kempo Karate'), ('Defensa Personal')
on conflict (name) do nothing;

-- 5. Add category_id to courses
alter table public.courses add column category_id uuid references public.categories(id) on delete set null;

-- 6. Migrate existing data from 'category' (enum) to 'category_id' (uuid)
update public.courses c
set category_id = cat.id
from public.categories cat
where c.category::text = cat.name;

-- 7. (Optional but recommended) After verifying data, drop the old column and enum
-- alter table public.courses drop column category;
-- drop type course_category;
