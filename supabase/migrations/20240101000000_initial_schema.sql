-- Create tables for the Smart Bus System

-- Students table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

-- Drivers table
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    driver_id TEXT NOT NULL UNIQUE
);

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    location TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled'))
);

-- Stops table
CREATE TABLE IF NOT EXISTS public.stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    location TEXT NOT NULL,
    address TEXT NOT NULL,
    lat FLOAT NOT NULL,
    lng FLOAT NOT NULL,
    is_stop BOOLEAN DEFAULT TRUE
);

-- Routes table
CREATE TABLE IF NOT EXISTS public.routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    stop_id UUID NOT NULL REFERENCES public.stops(id) ON DELETE CASCADE,
    arrival_time TEXT NOT NULL,
    students_count INTEGER NOT NULL DEFAULT 0,
    route_order INTEGER NOT NULL,
    date TEXT NOT NULL
);

-- Create RLS policies

-- Students table policies
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own profile"
    ON public.students FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Drivers can view all students"
    ON public.students FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.drivers
        WHERE user_id = auth.uid()
    ));

-- Drivers table policies
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view their own profile"
    ON public.drivers FOR SELECT
    USING (auth.uid() = user_id);

-- Bookings table policies
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own bookings"
    ON public.bookings FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.students
        WHERE id = student_id AND user_id = auth.uid()
    ));

CREATE POLICY "Students can create their own bookings"
    ON public.bookings FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.students
        WHERE id = student_id AND user_id = auth.uid()
    ));

CREATE POLICY "Students can update their own bookings"
    ON public.bookings FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.students
        WHERE id = student_id AND user_id = auth.uid()
    ));

CREATE POLICY "Drivers can view all bookings"
    ON public.bookings FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.drivers
        WHERE user_id = auth.uid()
    ));

-- Stops table policies
ALTER TABLE public.stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stops are viewable by all authenticated users"
    ON public.stops FOR SELECT
    USING (auth.role() = 'authenticated');

-- Routes table policies
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Routes are viewable by all authenticated users"
    ON public.routes FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Drivers can update routes"
    ON public.routes FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.drivers
        WHERE user_id = auth.uid()
    ));
