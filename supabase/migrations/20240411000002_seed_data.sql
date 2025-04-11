-- Seed data for the Smart Bus Routing System

-- Insert campus locations/stops
INSERT INTO stops (id, location, address, lat, lng, is_stop)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'East Campus Lecture Hall - ECLHC', 'ECLHC, NIT Calicut', 11.3218, 75.9336, true),
  ('22222222-2222-2222-2222-222222222222', 'North Campus - NLHC', 'NLHC, NIT Calicut', 11.3228, 75.9346, true),
  ('33333333-3333-3333-3333-333333333333', 'Central Library', 'Central Library, NIT Calicut', 11.3208, 75.9326, true),
  ('44444444-4444-4444-4444-444444444444', 'Rajpath NITC', 'Rajpath, NIT Calicut', 11.3198, 75.9316, true),
  ('55555555-5555-5555-5555-555555555555', 'Department Building', 'Department Building, NIT Calicut', 11.3188, 75.9306, true),
  ('66666666-6666-6666-6666-666666666666', 'Main Building', 'Main Building, NIT Calicut', 11.3178, 75.9296, true),
  ('77777777-7777-7777-7777-777777777777', 'School of Management Studies - SOMS', 'SOMS, NIT Calicut', 11.3168, 75.9286, true)
ON CONFLICT (id) DO NOTHING;

-- Insert demo student user
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES (
  '88888888-8888-8888-8888-888888888888',
  'student@nitc.edu',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Demo Student","role":"student"}'
)
ON CONFLICT (id) DO NOTHING;

-- Insert demo student password
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  '88888888-8888-8888-8888-888888888888',
  '88888888-8888-8888-8888-888888888888',
  '{"sub":"88888888-8888-8888-8888-888888888888","email":"student@nitc.edu"}',
  'email',
  'email',
  now(),
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Insert demo student profile
INSERT INTO students (id, user_id, name, email)
VALUES (
  '99999999-9999-9999-9999-999999999999',
  '88888888-8888-8888-8888-888888888888',
  'Demo Student',
  'student@nitc.edu'
)
ON CONFLICT (id) DO NOTHING;

-- Insert demo driver user
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'driver@nitc.ac.in',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Demo Driver","role":"driver"}'
)
ON CONFLICT (id) DO NOTHING;

-- Insert demo driver password
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","email":"driver@nitc.ac.in"}',
  'email',
  'email',
  now(),
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Insert demo driver profile
INSERT INTO drivers (id, user_id, name, email, driver_id)
VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Demo Driver',
  'driver@nitc.ac.in',
  'DRIVER001'
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample bookings
INSERT INTO bookings (id, student_id, location, date, time, status)
VALUES 
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '99999999-9999-9999-9999-999999999999', 'East Campus Lecture Hall - ECLHC', now(), '08:00', 'scheduled'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '99999999-9999-9999-9999-999999999999', 'Central Library', now() + interval '1 day', '09:00', 'scheduled'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '99999999-9999-9999-9999-999999999999', 'Department Building', now() + interval '2 days', '10:00', 'scheduled')
ON CONFLICT (id) DO NOTHING;
