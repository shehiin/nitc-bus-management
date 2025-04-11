-- Seed data for the Smart Bus Routing System

-- Clear existing data
TRUNCATE students, drivers, bookings, stops, routes CASCADE;

-- Insert campus stops
INSERT INTO stops (id, location, address, lat, lng, is_stop) VALUES
('eclhc', 'East Campus Lecture Hall', 'ECLHC, NIT Calicut', 11.3218, 75.9336, true),
('nlhc', 'North Campus', 'NLHC, NIT Calicut', 11.3228, 75.9346, true),
('library', 'Central Library', 'Central Library, NIT Calicut', 11.3208, 75.9326, true),
('rajpath', 'Rajpath NITC', 'Rajpath, NIT Calicut', 11.3198, 75.9316, true),
('dept', 'Department Building', 'Department Building, NIT Calicut', 11.3188, 75.9306, true),
('main', 'Main Building', 'Main Building, NIT Calicut', 11.3178, 75.9296, true),
('soms', 'School of Management Studies', 'SOMS, NIT Calicut', 11.3168, 75.9286, true);

-- Insert sample students
INSERT INTO students (id, name, email, user_id) VALUES
('student1', 'Mohammed Shehin', 'shehin@example.com', '1'),
('student2', 'Dhanus Raghav', 'dhanus@example.com', '2'),
('student3', 'Ch. Vinitha', 'vinitha@example.com', '3'),
('student4', 'G. Niteesha', 'niteesha@example.com', '4'),
('student5', 'Anoop KP', 'anoop@example.com', '5');

-- Insert sample drivers
INSERT INTO drivers (id, name, email, driver_id, user_id) VALUES
('driver1', 'John Driver', 'john@example.com', 'D001', '6');

-- Insert sample bookings
INSERT INTO bookings (id, student_id, location, date, time, status) VALUES
('booking1', 'student1', 'ECLHC', CURRENT_DATE, '08:00', 'scheduled'),
('booking2', 'student2', 'ECLHC', CURRENT_DATE, '08:00', 'scheduled'),
('booking3', 'student3', 'Central Library', CURRENT_DATE, '08:15', 'scheduled'),
('booking4', 'student4', 'Department Building', CURRENT_DATE, '08:30', 'scheduled'),
('booking5', 'student5', 'Department Building', CURRENT_DATE, '08:30', 'scheduled');

-- Insert sample routes
INSERT INTO routes (id, stop_id, arrival_time, students_count, route_order, date) VALUES
('route1', 'eclhc', '08:00', 2, 1, CURRENT_DATE),
('route2', 'library', '08:15', 1, 2, CURRENT_DATE),
('route3', 'dept', '08:30', 2, 3, CURRENT_DATE);
