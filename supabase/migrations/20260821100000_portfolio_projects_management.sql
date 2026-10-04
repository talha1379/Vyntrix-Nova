UPDATE public.portfolio_projects
SET status = CASE WHEN is_published THEN 'Published' ELSE 'Draft' END;

ALTER TABLE public.portfolio_projects
  ADD COLUMN IF NOT EXISTS short_description text NOT NULL DEFAULT '';

UPDATE public.portfolio_projects
SET short_description = COALESCE(description, '')
WHERE short_description = '';

ALTER TABLE public.portfolio_projects
  DROP CONSTRAINT IF EXISTS portfolio_projects_status_check;
ALTER TABLE public.portfolio_projects
  ADD CONSTRAINT portfolio_projects_status_check
  CHECK (status IN ('Draft', 'Published', 'Archived'));

CREATE TABLE public.project_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portfolio_projects(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  storage_path text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.project_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.project_images TO authenticated;
GRANT ALL ON public.project_images TO service_role;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read images for published projects" ON public.project_images
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.portfolio_projects p
    WHERE p.id = project_id AND p.status = 'Published' AND p.is_published = true
  ));
CREATE POLICY "Admins manage project images" ON public.project_images
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public can view project images" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'project-images');
CREATE POLICY "Admins upload project images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'project-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update project images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'project-images' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'project-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete project images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'project-images' AND public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_project_images_project_order ON public.project_images(project_id, is_primary DESC, display_order);