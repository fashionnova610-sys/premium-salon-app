-- Seed Data for Premium Salon App (Cameroon)

-- Note: Ensure that PostGIS is enabled before inserting geography points.
-- Password for all initial users will be 'password123' (if creating auth users directly). In Supabase local, it's easier to mock profiles directly if not using full auth endpoints in seed, but we need auth.users to exist due to FKs. 
-- In a real seed, we would use Supabase's auth.users or skip auth FK for mock data if possible. Since we have a trigger, we can just insert into auth.users and let the trigger create profiles.

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'owner1@salon.cm', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Amina Paul", "role": "owner"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'customer1@salon.cm', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Jean Dupont", "role": "customer"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'stylist1@salon.cm', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Marie Claire", "role": "job_seeker"}', now(), now());

-- Give the trigger a moment to fire and create profiles, but in a raw script, they run sequentially. Unsure if local instance handles triggers identically on raw SQL inserts, but it should.
-- Let's update the profiles created by the trigger to ensure data is solid.
update public.profiles set avatar_url = 'https://i.pravatar.cc/150?u=1' where id = '11111111-1111-1111-1111-111111111111';
update public.profiles set avatar_url = 'https://i.pravatar.cc/150?u=2' where id = '22222222-2222-2222-2222-222222222222';
update public.profiles set avatar_url = 'https://i.pravatar.cc/150?u=3' where id = '33333333-3333-3333-3333-333333333333';

-- Salons
insert into public.salons (id, owner_id, name, slug, description, address, city, country, location, average_rating, review_count)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'L''Eclat Beauty Center', 'eclat-beauty-douala', 'Premium hair and beauty services in the heart of Akwa, Douala.', 'Rue Drouot, Akwa', 'Douala', 'CM', st_point(9.7088, 4.0511), 4.8, 120),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Yaoundé Glamour Spa', 'yaounde-glamour', 'Exclusive relaxation and styling in Bastos.', 'Avenue Winston Churchill, Bastos', 'Yaoundé', 'CM', st_point(11.5013, 3.8480), 4.5, 85);

-- Services
insert into public.services (salon_id, name, description, price, currency, duration_minutes)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Silk Press & Treatment', 'Deep conditioning and flawless silk press.', 15000, 'XAF', 90),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Braids (Knotless)', 'Medium knotless braids with extensions included.', 25000, 'XAF', 240),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Bridal Makeup', 'Full face bridal makeup with premium products.', 35000, 'XAF', 120);

-- Employees
insert into public.salon_employees (id, salon_id, profile_id, title)
values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'Senior Stylist');

-- Appointments
insert into public.appointments (salon_id, customer_id, employee_id, service_id, status, date, start_time, end_time, price, currency)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', (select id from public.services where name = 'Silk Press & Treatment' limit 1), 'confirmed', current_date + interval '1 day', '10:00:00', '11:30:00', 15000, 'XAF');
