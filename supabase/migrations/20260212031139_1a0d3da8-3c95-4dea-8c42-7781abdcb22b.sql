
-- Add goals_materi and activity_report_text columns to activity_reports
ALTER TABLE public.activity_reports
ADD COLUMN goals_materi text DEFAULT NULL,
ADD COLUMN activity_report_text text DEFAULT NULL;
