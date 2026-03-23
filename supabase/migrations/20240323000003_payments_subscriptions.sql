-- Payments
create table public.payments (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    profile_id uuid references public.profiles(id) on delete restrict not null,
    salon_id uuid references public.salons(id) on delete cascade,
    amount numeric(10,2) not null,
    currency text default 'XAF' not null,
    payment_method public.payment_method not null,
    notchpay_reference text unique,
    status text default 'pending' not null, -- 'pending', 'complete', 'failed', 'refunded'
    description text
);

-- Subscriptions
create table public.subscriptions (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    salon_id uuid references public.salons(id) on delete cascade not null unique,
    tier public.subscription_tier default 'basic'::public.subscription_tier not null,
    status public.subscription_status default 'trialing'::public.subscription_status not null,
    current_period_start timestamp with time zone not null,
    current_period_end timestamp with time zone not null,
    cancel_at_period_end boolean default false not null,
    notchpay_subscription_id text unique
);

create trigger handle_updated_at_subscriptions before update on public.subscriptions
  for each row execute procedure moddatetime (updated_at);

-- Boosts
create table public.boosts (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    salon_id uuid references public.salons(id) on delete cascade,
    profile_id uuid references public.profiles(id) on delete cascade, -- for job seeker boosts
    payment_id uuid references public.payments(id) on delete restrict not null,
    boost_type public.boost_type not null,
    starts_at timestamp with time zone not null,
    ends_at timestamp with time zone not null,
    is_active boolean default true not null
);
