# Supabase Setup for NITC Smart Bus System

## Overview

This document provides instructions for setting up Supabase for the NITC Smart Bus System. The application uses Supabase for authentication, database, and real-time features.

## Setup Steps

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up or log in
2. Create a new project
3. Note your project URL and anon key (public API key)

### 2. Configure Environment Variables

Add the following environment variables to your project:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Set Up Database Schema

1. Go to the SQL Editor in your Supabase dashboard
2. Run the SQL commands from `supabase/migrations/20240101000000_initial_schema.sql`
3. Run the seed data commands from `supabase/seed.sql`

### 4. Configure Authentication

1. Go to Authentication > Settings in your Supabase dashboard
2. Under Email Auth, make sure "Enable Email Signup" is turned on
3. Optionally, configure email templates for confirmation, magic link, etc.

### 5. Create Demo Users

#### Student Demo User

1. Go to Authentication > Users in your Supabase dashboard
2. Click "Add User"
3. Create a user with:
   - Email: student@nitc.edu
   - Password: student123
4. After creating the user, note the user's UUID
5. Go to the SQL Editor and run:

```sql
INSERT INTO public.students (user_id, email, name)
VALUES 
    ('user-uuid-here', 'student@nitc.edu', 'Demo Student');
```

Replace `user-uuid-here` with the actual UUID of the user you created.

#### Driver Demo User

1. Go to Authentication > Users in your Supabase dashboard
2. Click "Add User"
3. Create a user with:
   - Email: driver@nitc.edu
   - Password: driver123
4. After creating the user, note the user's UUID
5. Go to the SQL Editor and run:

```sql
INSERT INTO public.drivers (user_id, email, name, driver_id)
VALUES 
    ('user-uuid-here', 'driver@nitc.edu', 'Demo Driver', 'DRIVER001');
```

Replace `user-uuid-here` with the actual UUID of the user you created.

### 6. Add Sample Data

Run the following SQL commands to add sample bookings:

```sql
-- Get the student ID
SELECT id FROM public.students WHERE email = 'student@nitc.edu';

-- Insert bookings using the student ID
INSERT INTO public.bookings (student_id, location, date, time, status)
VALUES
    ('student-id-here', 'ECLHC', '2023-05-15', '08:00', 'scheduled'),
    ('student-id-here', 'Central Library', '2023-05-16', '09:30', 'scheduled');
```

Replace `student-id-here` with the actual ID from the first query.

## Testing

After completing the setup, you should be able to:

1. Log in with the demo credentials
2. View and create bookings as a student
3. View routes and student pickups as a driver

## Troubleshooting

- If you encounter authentication issues, check that the environment variables are correctly set
- If data isn't appearing, verify that the RLS policies are correctly configured
- For any other issues, check the browser console for errors
