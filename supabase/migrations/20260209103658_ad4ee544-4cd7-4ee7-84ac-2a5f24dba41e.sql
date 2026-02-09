
-- Create schedule_entries table for persistent storage
CREATE TABLE public.schedule_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  coach TEXT NOT NULL,
  level TEXT NOT NULL,
  day TEXT NOT NULL,
  time TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.schedule_entries ENABLE ROW LEVEL SECURITY;

-- Since this is an internal scheduling app without auth, allow all operations publicly
-- (Can be restricted later when auth is added)
CREATE POLICY "Allow public read access" ON public.schedule_entries FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.schedule_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.schedule_entries FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.schedule_entries FOR DELETE USING (true);

-- Insert existing schedule data
INSERT INTO public.schedule_entries (student_name, coach, level, day, time, notes) VALUES
  ('Neil', 'Mr. Bani', 'Little Creator 1', 'sabtu', '09:00', NULL),
  ('Aufar', 'Mr. Argy', 'Teenager 1', 'sabtu', '10:00', NULL),
  ('Chelsea', 'Mr. Bani', 'Junior 1', 'sabtu', '10:00', NULL),
  ('Donna', 'Mr. Bani', 'Junior 1', 'sabtu', '10:00', NULL),
  ('George', 'Mr. Argy', 'Teenager 1', 'sabtu', '11:00', NULL),
  ('Marchia', 'Mr. Bani', 'Junior 1', 'sabtu', '11:00', NULL),
  ('Veve', 'Mr. Bani', 'Junior 1', 'senin', '13:00', NULL),
  ('Donna', 'Mr. Bani', 'Junior 1', 'senin', '13:00', NULL),
  ('Kristof', 'Mr. Bani', 'Little Creator 1', 'selasa', '13:00', NULL),
  ('Jetro', 'Mr. Argy', 'Teenager 2', 'sabtu', '13:00', NULL),
  ('El', 'Mr. Bani', 'Teenager 1', 'selasa', '14:00', NULL),
  ('Ismail', 'Mr. Bani', 'Little Creator 1', 'rabu', '14:00', NULL),
  ('Darren', 'Mr. Argy', 'Teenager 1', 'kamis', '14:00', NULL),
  ('Clarisha', 'Mr. Bani', 'Teenager 1', 'jumat', '14:00', NULL),
  ('Lubna', 'Mr. Bani', 'Trial Class', 'sabtu', '14:00', NULL),
  ('Lionel', 'Mr. Argy', 'Teenager 2', 'jumat', '14:00', NULL),
  ('Kania', 'Mr. Bani', 'Teenager 2', 'senin', '15:00', NULL),
  ('Nora', 'Mr. Bani', 'Little Creator 1', 'selasa', '15:00', NULL),
  ('Safaa', 'Mr. Bani', 'Junior 1', 'rabu', '15:00', NULL),
  ('Nael', 'Mr. Bani', 'Teenager 1', 'kamis', '15:00', NULL),
  ('Nael', 'Mr. Argy', 'Teenager 1', 'jumat', '15:00', NULL),
  ('Sherleen', 'Mr. Argy', 'Junior 1', 'kamis', '15:00', NULL),
  ('Ara', 'Mr. Bani', 'Little Creator 1', 'rabu', '16:00', NULL),
  ('Jacob', 'Mr. Argy', 'Teenager 2', 'kamis', '16:00', 'Cuti'),
  ('Barta', 'Mr. Argy', 'Teenager 2', 'kamis', '16:00', NULL),
  ('Nehal', 'Mr. Bani', 'Junior 1', 'jumat', '16:00', NULL),
  ('Ara', 'Mr. Bani', 'Little Creator 1', 'senin', '16:00', NULL),
  ('Bilal', 'Mr. Bani', 'Junior 1', 'kamis', '16:00', NULL),
  ('Barta', 'Mr. Argy', 'Teenager 1', 'jumat', '16:00', NULL),
  ('Luna', 'Mr. Argy', 'Little Creator 1', 'kamis', '17:00', 'Keep'),
  ('Abee', 'Mr. Bani', 'Trial Class', 'rabu', '17:00', NULL),
  ('Leia', 'Mr. Bani', 'Junior 1', 'kamis', '17:00', 'Keep');

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_schedule_entries_updated_at
BEFORE UPDATE ON public.schedule_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
