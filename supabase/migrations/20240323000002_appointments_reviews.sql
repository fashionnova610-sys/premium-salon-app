-- Appointments
create table public.appointments (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    salon_id uuid references public.salons(id) on delete cascade not null,
    employee_id uuid references public.salon_employees(id) on delete set null,
    customer_id uuid references public.profiles(id) on delete restrict not null,
    service_id uuid references public.services(id) on delete restrict not null,
    status public.appointment_status default 'pending'::public.appointment_status not null,
    date date not null,
    start_time time not null,
    end_time time not null,
    price numeric(10,2) not null,
    currency text default 'XAF' not null,
    notes text
);

create trigger handle_updated_at_appointments before update on public.appointments
  for each row execute procedure moddatetime (updated_at);

-- Portfolios
create table public.portfolio_items (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    author_id uuid references public.profiles(id) on delete cascade not null,
    salon_id uuid references public.salons(id) on delete cascade,
    media_url text not null,
    caption text,
    likes_count integer default 0
);

create table public.portfolio_likes (
    portfolio_item_id uuid references public.portfolio_items(id) on delete cascade not null,
    profile_id uuid references public.profiles(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (portfolio_item_id, profile_id)
);

create table public.portfolio_comments (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    portfolio_item_id uuid references public.portfolio_items(id) on delete cascade not null,
    profile_id uuid references public.profiles(id) on delete cascade not null,
    content text not null
);

-- Reviews
create table public.reviews (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    salon_id uuid references public.salons(id) on delete cascade not null,
    appointment_id uuid references public.appointments(id) on delete cascade not null unique,
    reviewer_id uuid references public.profiles(id) on delete cascade not null,
    rating integer not null check (rating >= 1 and rating <= 5),
    comment text
);

-- Auto-rating Trigger for Salons
create or replace function public.update_salon_rating()
returns trigger as $$
begin
  if tg_op = 'INSERT' or tg_op = 'UPDATE' then
    update public.salons
    set average_rating = (select avg(rating)::numeric(3,2) from public.reviews where salon_id = new.salon_id),
        review_count = (select count(*) from public.reviews where salon_id = new.salon_id)
    where id = new.salon_id;
  elsif tg_op = 'DELETE' then
    update public.salons
    set average_rating = coalesce((select avg(rating)::numeric(3,2) from public.reviews where salon_id = old.salon_id), 0.00),
        review_count = coalesce((select count(*) from public.reviews where salon_id = old.salon_id), 0)
    where id = old.salon_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_review_changed
  after insert or update or delete on public.reviews
  for each row execute procedure public.update_salon_rating();
