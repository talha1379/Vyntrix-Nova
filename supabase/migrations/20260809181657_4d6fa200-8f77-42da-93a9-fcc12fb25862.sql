-- PROJECTS
CREATE TABLE public.client_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_user_id uuid,
  name text NOT NULL,
  summary text,
  status text NOT NULL DEFAULT 'Discovery',
  progress integer NOT NULL DEFAULT 0,
  start_date date,
  target_date date,
  currency text NOT NULL DEFAULT 'USD',
  contract_value_usd numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_projects TO authenticated;
GRANT ALL ON public.client_projects TO service_role;
ALTER TABLE public.client_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage projects" ON public.client_projects FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Clients read own projects" ON public.client_projects FOR SELECT TO authenticated
  USING (client_user_id = auth.uid());
CREATE TRIGGER client_projects_updated_at BEFORE UPDATE ON public.client_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.owns_project(_project_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.client_projects p WHERE p.id = _project_id AND p.client_user_id = auth.uid())
$$;
REVOKE ALL ON FUNCTION public.owns_project(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.owns_project(uuid) TO authenticated;

-- MILESTONES
CREATE TABLE public.project_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'Planned',
  due_date date,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_milestones TO authenticated;
GRANT ALL ON public.project_milestones TO service_role;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage milestones" ON public.project_milestones FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Clients read own milestones" ON public.project_milestones FOR SELECT TO authenticated
  USING (public.owns_project(project_id));
CREATE TRIGGER project_milestones_updated_at BEFORE UPDATE ON public.project_milestones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- FILES
CREATE TABLE public.project_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  label text NOT NULL,
  url text NOT NULL,
  file_type text NOT NULL DEFAULT 'link',
  size_kb integer,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_files TO authenticated;
GRANT ALL ON public.project_files TO service_role;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage files" ON public.project_files FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Clients read own files" ON public.project_files FOR SELECT TO authenticated
  USING (public.owns_project(project_id));
CREATE TRIGGER project_files_updated_at BEFORE UPDATE ON public.project_files
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- INVOICES
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  number text NOT NULL,
  description text,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'Draft',
  issued_at date NOT NULL DEFAULT current_date,
  due_at date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage invoices" ON public.invoices FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Clients read own invoices" ON public.invoices FOR SELECT TO authenticated
  USING (public.owns_project(project_id));
CREATE TRIGGER invoices_updated_at BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- MESSAGES
CREATE TABLE public.project_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  sender_label text NOT NULL DEFAULT 'Client',
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_messages TO authenticated;
GRANT ALL ON public.project_messages TO service_role;
ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage messages" ON public.project_messages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Clients read own messages" ON public.project_messages FOR SELECT TO authenticated
  USING (public.owns_project(project_id));
CREATE POLICY "Clients post on own projects" ON public.project_messages FOR INSERT TO authenticated
  WITH CHECK (public.owns_project(project_id) AND sender_id = auth.uid());
CREATE TRIGGER project_messages_updated_at BEFORE UPDATE ON public.project_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_milestones_project ON public.project_milestones(project_id);
CREATE INDEX idx_files_project ON public.project_files(project_id);
CREATE INDEX idx_invoices_project ON public.invoices(project_id);
CREATE INDEX idx_messages_project ON public.project_messages(project_id, created_at);