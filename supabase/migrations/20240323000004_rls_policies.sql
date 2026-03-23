-- Enable RLS
alter table public.profiles enable row level security;
alter table public.salons enable row level security;
alter table public.services enable row level security;
alter table public.salon_employees enable row level security;
alter table public.working_hours enable row level security;
alter table public.appointments enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.portfolio_likes enable row level security;
alter table public.portfolio_comments enable row level security;
alter table public.reviews enable row level security;
alter table public.payments enable row level security;
alter table public.subscriptions enable row level security;
alter table public.boosts enable row level security;

-- Helper functions
create or replace function public.get_user_role()
returns public.user_role as $$
  select role from public.profiles where id = auth.uid() limit 1;
$$ language sql security definer;

create or replace function public.is_salon_owner(target_salon_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.salons 
    where id = target_salon_id and owner_id = auth.uid()
  );
$$ language sql security definer;

create or replace function public.is_salon_employee(target_salon_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.salon_employees
    where salon_id = target_salon_id and profile_id = auth.uid() and is_active = true
  );
$$ language sql security definer;

-- Profiles Policies
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- Salons Policies
create policy "Salons are viewable by everyone" on public.salons for select using (true);
create policy "Owners can insert salons" on public.salons for insert with check (auth.uid() = owner_id and public.get_user_role() = 'owner');
create policy "Owners can update their salons" on public.salons for update using (public.is_salon_owner(id));

-- Services Policies
create policy "Services are viewable by everyone" on public.services for select using (true);
create policy "Owners can manage services" on public.services for all using (public.is_salon_owner(salon_id));

-- Employees & Working Hours Policies
create policy "Employees are viewable by everyone" on public.salon_employees for select using (true);
create policy "Owners can manage employees" on public.salon_employees for all using (public.is_salon_owner(salon_id));

create policy "Working hours are viewable by everyone" on public.working_hours for select using (true);
create policy "Owners can manage working hours" on public.working_hours for all using (public.is_salon_owner(salon_id));

-- Appointments Policies
create policy "Users can view their own appointments" on public.appointments for select using (auth.uid() = customer_id or public.is_salon_owner(salon_id) or public.is_salon_employee(salon_id));
create policy "Customers can book appointments" on public.appointments for insert with check (auth.uid() = customer_id);
create policy "Customers can cancel, owners can manage appointments" on public.appointments for update using (auth.uid() = customer_id or public.is_salon_owner(salon_id) or public.is_salon_employee(salon_id));

-- Portfolios Policies
create policy "Portfolios are viewable by everyone" on public.portfolio_items for select using (true);
create policy "Authors can insert portfolio" on public.portfolio_items for insert with check (auth.uid() = author_id);
create policy "Authors can update portfolio" on public.portfolio_items for update using (auth.uid() = author_id);
create policy "Authors can delete portfolio" on public.portfolio_items for delete using (auth.uid() = author_id);

create policy "Portfolio likes are viewable by everyone" on public.portfolio_likes for select using (true);
create policy "Users can like/unlike" on public.portfolio_likes for all using (auth.uid() = profile_id);

create policy "Comments are viewable by everyone" on public.portfolio_comments for select using (true);
create policy "Users can comment" on public.portfolio_comments for insert with check (auth.uid() = profile_id);
create policy "Authors can manage their comments" on public.portfolio_comments for update using (auth.uid() = profile_id);
create policy "Authors can delete their comments" on public.portfolio_comments for delete using (auth.uid() = profile_id);

-- Reviews
create policy "Reviews are viewable by everyone" on public.reviews for select using (true);
create policy "Customers can write reviews" on public.reviews for insert with check (auth.uid() = reviewer_id);
create policy "Customers can manage their reviews" on public.reviews for update using (auth.uid() = reviewer_id);
create policy "Customers can delete their reviews" on public.reviews for delete using (auth.uid() = reviewer_id);

-- Payments, Subscriptions, Boosts
create policy "Users can view their own payments" on public.payments for select using (auth.uid() = profile_id or public.is_salon_owner(salon_id));
create policy "Owners can view their salon subscriptions" on public.subscriptions for select using (public.is_salon_owner(salon_id));
create policy "Boosts are viewable by everyone" on public.boosts for select using (true);
