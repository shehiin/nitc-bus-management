-- Create tables for the Smart Bus Routing System

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  driver_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id),
  location TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stops table
CREATE TABLE IF NOT EXISTS stops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  is_stop BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE stops ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Students can view their own data" ON students;
CREATE POLICY "Students can view their own data"
  ON students FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Drivers can view their own data" ON drivers;
CREATE POLICY "Drivers can view their own data"
  ON drivers FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can view their own bookings" ON bookings;
CREATE POLICY "Students can view their own bookings"
  ON bookings FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Students can insert their own bookings" ON bookings;
CREATE POLICY "Students can insert their own bookings"
  ON bookings FOR INSERT
  WITH CHECK (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Students can update their own bookings" ON bookings;
CREATE POLICY "Students can update their own bookings"
  ON bookings FOR UPDATE
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Anyone can view stops" ON stops;
CREATE POLICY "Anyone can view stops"
  ON stops FOR SELECT
  USING (true);

-- Enable realtime
alter publication supabase_realtime add table bookings;
alter publication supabase_realtime add table stops;
