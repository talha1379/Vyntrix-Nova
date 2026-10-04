CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  department text NOT NULL,
  employment_type text NOT NULL,
  location text NOT NULL,
  experience_level text NOT NULL,
  short_description text NOT NULL,
  description text NOT NULL,
  responsibilities text NOT NULL DEFAULT '',
  requirements text NOT NULL DEFAULT '',
  skills text[] NOT NULL DEFAULT '{}',
  benefits text NOT NULL DEFAULT '',
  application_deadline date,
  status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published', 'Closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  location text NOT NULL,
  linkedin_url text,
  portfolio_url text,
  cover_message text NOT NULL,
  resume_url text NOT NULL,
  status text NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Reviewing', 'Shortlisted', 'Interview', 'Selected', 'Rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.jobs TO anon, authenticated;
GRANT INSERT ON public.job_applications TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.job_applications TO authenticated;
GRANT ALL ON public.jobs, public.job_applications TO service_role;

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published jobs" ON public.jobs FOR SELECT TO anon, authenticated
  USING (status = 'Published');
CREATE POLICY "Admins manage jobs" ON public.jobs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Public can submit applications for published jobs" ON public.job_applications FOR INSERT TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.jobs WHERE id = job_id AND status = 'Published'));
CREATE POLICY "Admins manage applications" ON public.job_applications FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER jobs_updated_at BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER job_applications_updated_at BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_jobs_status_created ON public.jobs(status, created_at DESC);
CREATE INDEX idx_job_applications_job ON public.job_applications(job_id, created_at DESC);

INSERT INTO storage.buckets (id, name, public) VALUES ('job-resumes', 'job-resumes', false)
  ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Applicants can upload resumes" ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'job-resumes');
CREATE POLICY "Admins can read resumes" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'job-resumes' AND public.has_role(auth.uid(), 'admin'));