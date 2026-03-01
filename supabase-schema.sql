-- 1. ENUMS
create type user_role as enum ('user', 'admin');
create type course_category as enum ('MMA', 'Jiu-Jitsu', 'Kempo Karate', 'Defensa Personal');
create type purchase_status as enum ('initiated', 'paid', 'failed', 'expired', 'gifted');
create type subscription_status as enum ('initiated', 'active', 'expired', 'failed');
create type discount_type as enum ('percentage', 'fixed');
create type download_type as enum ('pdf', 'certificate');

-- 2. PROFILES (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  role user_role default 'user',
  created_at timestamptz default now()
);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'name', 
    'user'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. COURSES
create table public.courses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  short_description text,
  full_description text,
  bunny_video_id text,
  thumbnail_url text,
  price numeric(10,2) default 0,
  is_free boolean default false,
  included_in_subscription boolean default false,
  is_published boolean default false,
  featured boolean default false,
  category course_category not null,
  order_index integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. COURSE TIMESTAMPS
create table public.course_timestamps (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references public.courses(id) on delete cascade,
  minute_mark integer not null,
  description text not null
);

-- 5. COURSE DOWNLOADS
create table public.course_downloads (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  file_url text not null,
  type download_type default 'pdf',
  created_at timestamptz default now()
);

-- 6. COURSE COMMENTS
create table public.course_comments (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references public.courses(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  is_deleted boolean default false,
  created_at timestamptz default now()
);

-- 7. LEARNING PATHS
create table public.learning_paths (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  is_published boolean default false,
  created_at timestamptz default now()
);

create table public.learning_path_courses (
  id uuid primary key default uuid_generate_v4(),
  learning_path_id uuid references public.learning_paths(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  order_index integer default 0,
  unique(learning_path_id, course_id)
);

-- 8. SUBSCRIPTION PLANS
create table public.subscription_plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price numeric(10,2) not null,
  duration_days integer not null,
  is_active boolean default true,
  features jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- 9. USER SUBSCRIPTIONS
create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  plan_id uuid references public.subscription_plans(id) on delete restrict,
  start_date timestamptz not null default now(),
  end_date timestamptz not null,
  status subscription_status default 'initiated',
  created_at timestamptz default now()
);

-- 10. PURCHASES
create table public.purchases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete restrict,
  amount_paid numeric(10,2) not null,
  currency text default 'USD',
  status purchase_status default 'initiated',
  transaction_id text,
  expires_at timestamptz,
  gifted_by_admin_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 11. PROGRESS & ACHIEVEMENTS
create table public.course_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  watch_percentage integer default 0,
  completed boolean default false,
  completed_at timestamptz,
  unique(user_id, course_id)
);

create table public.achievements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  icon_url text,
  condition_type text not null, -- e.g., 'courses_completed', 'subscription_days'
  condition_value integer not null,
  hex_color text default '#3b82f6',
  created_at timestamptz default now()
);

create table public.user_achievements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  achievement_id uuid references public.achievements(id) on delete cascade,
  unlocked_at timestamptz default now(),
  unique(user_id, achievement_id)
);

-- 12. DISCOUNTS
create table public.discounts (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  type discount_type not null,
  value numeric(10,2) not null,
  expires_at timestamptz,
  max_uses integer default 0,
  used_count integer default 0,
  applicable_course_id uuid references public.courses(id) on delete cascade,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 12. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_timestamps enable row level security;
alter table public.course_downloads enable row level security;
alter table public.course_comments enable row level security;
alter table public.learning_paths enable row level security;
alter table public.learning_path_courses enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.purchases enable row level security;
alter table public.course_progress enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.discounts enable row level security;

-- Profiles: Users can view/edit themselves. Admins see all.
create policy "Users manage own profile" on profiles for all using (auth.uid() = id);
create policy "Admins see all profiles" on profiles for select using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Courses: Anyone can see published courses. Admins manage all.
create policy "Public courses" on courses for select using (is_published = true);
create policy "Admin courses" on courses for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Subscriptions & Purchases: User sees own. Admins see all.
create policy "Users see own purchases" on purchases for select using (auth.uid() = user_id);
create policy "Admin manage purchases" on purchases for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "Users see own subscriptions" on subscriptions for select using (auth.uid() = user_id);
create policy "Admin manage subscriptions" on subscriptions for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Progress: User manages own.
create policy "Users manage own progress" on course_progress for all using (auth.uid() = user_id);

-- Discounts: public can read active discounts, admins manage all
create policy "Public read active discounts" on discounts for select using (is_active = true);
create policy "Admins manage discounts" on discounts for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
