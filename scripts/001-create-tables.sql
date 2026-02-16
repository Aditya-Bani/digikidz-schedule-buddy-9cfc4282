-- Create custom enum type
CREATE TYPE public.app_role AS ENUM ('admin');

-- Create schedule_entries table
CREATE TABLE public.schedule_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  day TEXT NOT NULL,
  time TEXT NOT NULL,
  level TEXT NOT NULL,
  coach TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create activity_reports table
CREATE TABLE public.activity_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  date TEXT NOT NULL,
  lesson_name TEXT NOT NULL,
  lesson_week INTEGER NOT NULL,
  level TEXT NOT NULL,
  coach TEXT NOT NULL,
  goals_materi TEXT,
  tools TEXT,
  activity_report_text TEXT,
  coach_comment TEXT,
  media_urls TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create student_access_codes table
CREATE TABLE public.student_access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  access_code TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL
);

-- Create has_role function
CREATE OR REPLACE FUNCTION public.has_role(_role public.app_role, _user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE public.schedule_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS policies for schedule_entries (admin full access, public read)
CREATE POLICY "Allow public read schedule_entries" ON public.schedule_entries
  FOR SELECT USING (true);

CREATE POLICY "Allow admin insert schedule_entries" ON public.schedule_entries
  FOR INSERT WITH CHECK (public.has_role('admin', auth.uid()));

CREATE POLICY "Allow admin update schedule_entries" ON public.schedule_entries
  FOR UPDATE USING (public.has_role('admin', auth.uid()));

CREATE POLICY "Allow admin delete schedule_entries" ON public.schedule_entries
  FOR DELETE USING (public.has_role('admin', auth.uid()));

-- RLS policies for activity_reports (admin full access, public read)
CREATE POLICY "Allow public read activity_reports" ON public.activity_reports
  FOR SELECT USING (true);

CREATE POLICY "Allow admin insert activity_reports" ON public.activity_reports
  FOR INSERT WITH CHECK (public.has_role('admin', auth.uid()));

CREATE POLICY "Allow admin update activity_reports" ON public.activity_reports
  FOR UPDATE USING (public.has_role('admin', auth.uid()));

CREATE POLICY "Allow admin delete activity_reports" ON public.activity_reports
  FOR DELETE USING (public.has_role('admin', auth.uid()));

-- RLS policies for student_access_codes (admin full access, public read for portal)
CREATE POLICY "Allow public read student_access_codes" ON public.student_access_codes
  FOR SELECT USING (true);

CREATE POLICY "Allow admin insert student_access_codes" ON public.student_access_codes
  FOR INSERT WITH CHECK (public.has_role('admin', auth.uid()));

CREATE POLICY "Allow admin update student_access_codes" ON public.student_access_codes
  FOR UPDATE USING (public.has_role('admin', auth.uid()));

CREATE POLICY "Allow admin delete student_access_codes" ON public.student_access_codes
  FOR DELETE USING (public.has_role('admin', auth.uid()));

-- RLS policies for user_roles (admin read only)
CREATE POLICY "Allow authenticated read user_roles" ON public.user_roles
  FOR SELECT USING (auth.uid() IS NOT NULL);
