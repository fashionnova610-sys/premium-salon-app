-- Functions
create or replace function public.get_nearby_salons(
  lat double precision,
  long double precision,
  radius_meters double precision
)
returns table (
  id uuid,
  name text,
  slug text,
  description text,
  logo_url text,
  cover_url text,
  address text,
  city text,
  country text,
  average_rating numeric,
  review_count integer,
  dist_meters float,
  is_boosted boolean
)
language sql security definer
as $$
  select
    s.id, s.name, s.slug, s.description, s.logo_url, s.cover_url, s.address, s.city, s.country, s.average_rating, s.review_count,
    st_distance(s.location, st_point(long, lat)::geography) as dist_meters,
    exists (
      select 1 from public.boosts b 
      where b.salon_id = s.id and b.is_active = true 
      and b.starts_at <= now() and b.ends_at >= now()
    ) as is_boosted
  from public.salons s
  where s.is_active = true
    and st_dwithin(s.location, st_point(long, lat)::geography, radius_meters)
  order by is_boosted desc, dist_meters asc;
$$;

create or replace function public.get_salon_revenue(
  target_salon_id uuid,
  start_date timestamp with time zone,
  end_date timestamp with time zone
)
returns numeric
language sql security definer
as $$
  select coalesce(sum(amount), 0)
  from public.payments
  where salon_id = target_salon_id
    and status = 'complete'
    and created_at >= start_date
    and created_at <= end_date;
$$;

create or replace function public.get_nearby_talent(
  lat double precision,
  long double precision,
  radius_meters double precision,
  specialty_filter text default null
)
returns table (
  profile_id uuid,
  full_name text,
  avatar_url text,
  is_boosted boolean
)
language sql security definer
as $$
  -- Assuming job seekers have a 'job_seeker' role
  select
    p.id as profile_id, p.full_name, p.avatar_url,
    exists (
      select 1 from public.boosts b 
      where b.profile_id = p.id and b.is_active = true 
      and b.starts_at <= now() and b.ends_at >= now()
    ) as is_boosted
  from public.profiles p
  where p.role = 'job_seeker'
  order by is_boosted desc, p.created_at desc;
$$;

-- Indexes
create index salons_location_idx on public.salons using gist(location);
create index appointments_salon_date_idx on public.appointments(salon_id, date);
create index portfolio_salon_idx on public.portfolio_items(salon_id);
create index reviews_salon_idx on public.reviews(salon_id);
create index boosts_active_idx on public.boosts(salon_id, profile_id) where is_active = true;

-- Storage Buckets Configuration
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
insert into storage.buckets (id, name, public) values ('salon-media', 'salon-media', true);
insert into storage.buckets (id, name, public) values ('portfolios', 'portfolios', true);
insert into storage.buckets (id, name, public) values ('job-seeker-portfolios', 'job-seeker-portfolios', true);

-- Storage Policies
create policy "Avatar images are publicly accessible." on storage.objects for select using ( bucket_id = 'avatars' );
create policy "Anyone can upload an avatar." on storage.objects for insert with check ( bucket_id = 'avatars' );
create policy "Salon media is publicly accessible." on storage.objects for select using ( bucket_id = 'salon-media' );
create policy "Portfolios are publicly accessible." on storage.objects for select using ( bucket_id = 'portfolios' );
create policy "Job seeker portfolios are publicly accessible." on storage.objects for select using ( bucket_id = 'job-seeker-portfolios' );
