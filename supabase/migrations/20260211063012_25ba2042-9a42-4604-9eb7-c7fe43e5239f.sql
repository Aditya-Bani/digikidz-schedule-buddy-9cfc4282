
-- Table for student access codes (parent portal)
CREATE TABLE public.student_access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  access_code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.student_access_codes ENABLE ROW LEVEL SECURITY;

-- Public read (parents need to look up by code)
CREATE POLICY "Allow public read by access code" ON public.student_access_codes
  FOR SELECT USING (true);

-- Public insert/update/delete for admin (no auth yet)
CREATE POLICY "Allow public insert" ON public.student_access_codes
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.student_access_codes
  FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.student_access_codes
  FOR DELETE USING (true);

-- Activity reports table
CREATE TABLE public.activity_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  date date NOT NULL,
  level text NOT NULL,
  lesson_week int NOT NULL,
  lesson_name text NOT NULL,
  tools text,
  coach text NOT NULL,
  coach_comment text,
  media_urls text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON public.activity_reports
  FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.activity_reports
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.activity_reports
  FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.activity_reports
  FOR DELETE USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_activity_reports_updated_at
  BEFORE UPDATE ON public.activity_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for report media
INSERT INTO storage.buckets (id, name, public) VALUES ('report-media', 'report-media', true);

CREATE POLICY "Allow public upload to report-media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'report-media');
CREATE POLICY "Allow public read from report-media" ON storage.objects
  FOR SELECT USING (bucket_id = 'report-media');
CREATE POLICY "Allow public delete from report-media" ON storage.objects
  FOR DELETE USING (bucket_id = 'report-media');
