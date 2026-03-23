-- Enable PostGIS
create extension if not exists postgis schema extensions;

-- Create Enums
create type public.user_role as enum ('customer', 'owner', 'employee', 'job_seeker');
create type public.payment_method as enum ('notchpay_momo', 'notchpay_orange', 'bank_transfer', 'cash', 'card');
create type public.appointment_status as enum ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
create type public.subscription_tier as enum ('basic', 'standard', 'pro');
create type public.subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'unpaid');
create type public.boost_type as enum ('search_boost', 'category_boost');

-- Profiles Table
create table public.profiles (
    id uuid references auth.users on delete cascade not null primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    full_name text not null,
    avatar_url text,
    phone text,
    role user_role default 'customer'::user_role not null,
    push_token text
);

-- Profiles Updated At Trigger
create extension if not exists moddatetime schema extensions;
create trigger handle_updated_at before update on public.profiles
  for each row execute procedure moddatetime (updated_at);

-- Handle New User Trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'User'),
    new.raw_user_meta_data->>'avatar_url',
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'customer'::user_role)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Salons Table
create table public.salons (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    owner_id uuid references public.profiles(id) on delete restrict not null,
    name text not null,
    slug text not null unique,
    description text,
    logo_url text,
    cover_url text,
    address text not null,
    city text not null,
    country text default 'CM' not null,
    phone text,
    whatsapp text,
    location geography(Point, 4326) not null,
    is_active boolean default true not null,
    average_rating numeric(3,2) default 0.00,
    review_count integer default 0
);

-- Services Table
create table public.services (
    id uuid default gen_random_uuid() primary key,
    salon_id uuid references public.salons(id) on delete cascade not null,
    name text not null,
    description text,
    price numeric(10,2) not null,
    currency text default 'XAF' not null,
    duration_minutes integer not null,
    is_active boolean default true not null
);

-- Salon Employees
create table public.salon_employees (
    id uuid default gen_random_uuid() primary key,
    salon_id uuid references public.salons(id) on delete cascade not null,
    profile_id uuid references public.profiles(id) on delete restrict not null,
    title text,
    is_active boolean default true not null,
    unique(salon_id, profile_id)
);

-- Working Hours
create table public.working_hours (
    id uuid default gen_random_uuid() primary key,
    salon_id uuid references public.salons(id) on delete cascade not null,
    employee_id uuid references public.salon_employees(id) on delete cascade, -- null means general salon hours
    day_of_week integer not null check (day_of_week between 0 and 6), -- 0=Sunday
    open_time time not null,
    close_time time not null,
    is_closed boolean default false not null,
    unique(salon_id, employee_id, day_of_week)
);
