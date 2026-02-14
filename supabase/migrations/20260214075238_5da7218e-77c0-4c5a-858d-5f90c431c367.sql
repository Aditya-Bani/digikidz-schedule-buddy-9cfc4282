
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Only admins can read roles
CREATE POLICY "Admins can read roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Update schedule_entries policies: public can read, only admin can write
DROP POLICY IF EXISTS "Allow public delete access" ON public.schedule_entries;
DROP POLICY IF EXISTS "Allow public insert access" ON public.schedule_entries;
DROP POLICY IF EXISTS "Allow public update access" ON public.schedule_entries;

CREATE POLICY "Admin can insert schedule"
ON public.schedule_entries FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update schedule"
ON public.schedule_entries FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete schedule"
ON public.schedule_entries FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update activity_reports policies: public can read, only admin can write
DROP POLICY IF EXISTS "Allow public delete" ON public.activity_reports;
DROP POLICY IF EXISTS "Allow public insert" ON public.activity_reports;
DROP POLICY IF EXISTS "Allow public update" ON public.activity_reports;

CREATE POLICY "Admin can insert reports"
ON public.activity_reports FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update reports"
ON public.activity_reports FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete reports"
ON public.activity_reports FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update student_access_codes policies: public can read, only admin can write
DROP POLICY IF EXISTS "Allow public delete" ON public.student_access_codes;
DROP POLICY IF EXISTS "Allow public insert" ON public.student_access_codes;
DROP POLICY IF EXISTS "Allow public update" ON public.student_access_codes;

CREATE POLICY "Admin can insert access codes"
ON public.student_access_codes FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update access codes"
ON public.student_access_codes FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete access codes"
ON public.student_access_codes FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
