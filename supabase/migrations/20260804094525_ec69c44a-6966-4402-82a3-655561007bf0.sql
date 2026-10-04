
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'client');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  tagline text,
  description text,
  icon text,
  starting_price_usd numeric,
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  locale text NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.portfolio_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  client_name text,
  category text NOT NULL,
  thumbnail_url text,
  hero_image_url text,
  gallery_urls text[] NOT NULL DEFAULT '{}',
  description text,
  problem text,
  solution text,
  technologies text[] NOT NULL DEFAULT '{}',
  duration text,
  live_url text,
  github_url text,
  is_featured boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'Live',
  tags text[] NOT NULL DEFAULT '{}',
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  locale text NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  author_role text,
  company text,
  quote text NOT NULL,
  rating int NOT NULL DEFAULT 5,
  avatar_url text,
  company_logo_url text,
  video_url text,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  locale text NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  locale text NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  position text NOT NULL,
  bio text,
  photo_url text,
  skills text[] NOT NULL DEFAULT '{}',
  linkedin_url text,
  github_url text,
  experience text,
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  locale text NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.services, public.portfolio_projects, public.testimonials, public.faqs, public.team_members TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services, public.portfolio_projects, public.testimonials, public.faqs, public.team_members TO authenticated;
GRANT ALL ON public.services, public.portfolio_projects, public.testimonials, public.faqs, public.team_members TO service_role;

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published services" ON public.services FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admins manage services" ON public.services FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can read published projects" ON public.portfolio_projects FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admins manage projects" ON public.portfolio_projects FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can read published testimonials" ON public.testimonials FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admins manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can read published faqs" ON public.faqs FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admins manage faqs" ON public.faqs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can read published team" ON public.team_members FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admins manage team" ON public.team_members FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER portfolio_updated_at BEFORE UPDATE ON public.portfolio_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER testimonials_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER faqs_updated_at BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER team_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.services (title, slug, tagline, description, icon, starting_price_usd, sort_order) VALUES
('Web Development', 'web-development', 'Fast, scalable web platforms', 'Custom web applications and marketing sites built with modern React stacks, tuned for speed, SEO and conversion.', 'Code2', 1200, 1),
('Mobile Apps', 'mobile-apps', 'iOS & Android from one codebase', 'Cross-platform mobile products with native-grade performance, offline support and app store delivery handled end to end.', 'Smartphone', 2500, 2),
('AI Solutions', 'ai-solutions', 'Ship AI that actually works', 'Chatbots, copilots, document intelligence and automation pipelines integrated directly into your existing workflows.', 'Sparkles', 1800, 3),
('UI/UX Design', 'ui-ux-design', 'Interfaces people trust', 'Research-driven product design: user flows, wireframes, design systems and pixel-accurate prototypes.', 'PenTool', 900, 4),
('Branding', 'branding', 'Identity with intent', 'Logo systems, visual language, brand guidelines and collateral that make you look like the category leader.', 'Palette', 700, 5),
('SEO & Growth', 'seo-growth', 'Compounding organic traffic', 'Technical SEO, content architecture and analytics instrumentation that turn traffic into qualified pipeline.', 'TrendingUp', 500, 6);

INSERT INTO public.portfolio_projects (name, slug, client_name, category, description, problem, solution, technologies, duration, is_featured, status, tags, sort_order) VALUES
('Meridian Trade Portal', 'meridian-trade-portal', 'Meridian Logistics', 'Web', 'A real-time shipment tracking and quoting portal serving 40+ freight partners.', 'Quotes were handled over email, taking up to 48 hours per request.', 'A self-serve portal with live rate calculation cut quoting time to under 3 minutes.', ARRAY['React','TypeScript','Postgres','Stripe'], '14 weeks', true, 'Live', ARRAY['Logistics','SaaS'], 1),
('Nimbus Health App', 'nimbus-health-app', 'Nimbus Care', 'Mobile', 'Patient companion app with appointment booking, reminders and secure messaging.', 'Clinic no-show rate sat at 22% with no digital touchpoint.', 'Push reminders and one-tap rescheduling dropped no-shows to 7%.', ARRAY['React Native','Expo','Supabase'], '10 weeks', true, 'Live', ARRAY['Healthcare','Mobile'], 2),
('Lexi Contract AI', 'lexi-contract-ai', 'Lexi Legal', 'AI', 'An AI assistant that reviews commercial contracts and flags risky clauses.', 'Associates spent 6+ hours per contract on first-pass review.', 'A retrieval-augmented review engine reduced first-pass review to 25 minutes.', ARRAY['Next.js','Claude API','pgvector'], '12 weeks', true, 'Live', ARRAY['AI','Legal'], 3),
('Aurora Commerce', 'aurora-commerce', 'Aurora Retail', 'Web', 'Headless storefront rebuild for a multi-region fashion retailer.', 'Legacy storefront loaded in 6.4s and lost mobile buyers.', 'A headless rebuild hit 1.1s LCP and lifted mobile conversion by 34%.', ARRAY['React','Tailwind','Shopify'], '16 weeks', false, 'Live', ARRAY['E-commerce'], 4),
('Halo Brand System', 'halo-brand-system', 'Halo Studio', 'Branding', 'Complete identity system for a boutique architecture practice.', 'Inconsistent visuals across pitch decks, site and signage.', 'A single brand system unified every touchpoint and won three new tenders.', ARRAY['Figma','Illustrator'], '6 weeks', false, 'Live', ARRAY['Branding','Design'], 5),
('Pulse Analytics', 'pulse-analytics', 'Pulse Media', 'UI', 'Analytics dashboard for a media network tracking 12M monthly readers.', 'Editors could not see performance without asking the data team.', 'A self-serve dashboard gave editors live metrics and cut report requests by 80%.', ARRAY['React','Recharts','Postgres'], '8 weeks', false, 'In Progress', ARRAY['Dashboard','SaaS'], 6);

INSERT INTO public.testimonials (author_name, author_role, company, quote, rating, is_featured, sort_order) VALUES
('Sara Ahmed', 'Head of Product', 'Meridian Logistics', 'They shipped in fourteen weeks what our previous vendor could not deliver in a year. The quoting portal paid for itself in the first quarter.', 5, true, 1),
('Daniel Roth', 'Founder', 'Nimbus Care', 'The team understood our clinical constraints immediately. No-shows are down two-thirds and patients actually compliment the app.', 5, true, 2),
('Ayesha Khan', 'General Counsel', 'Lexi Legal', 'Genuinely careful engineering on a sensitive problem. The contract review assistant is now part of every matter we open.', 5, true, 3),
('Marco Villa', 'CMO', 'Aurora Retail', 'Page speed went from an embarrassment to a competitive advantage. Mobile revenue is up thirty-four percent.', 5, false, 4);

INSERT INTO public.faqs (question, answer, category, sort_order) VALUES
('How long does a typical project take?', 'Most engagements run between 6 and 16 weeks depending on scope. We share a phased timeline with milestones before any work begins.', 'Process', 1),
('How do you price projects?', 'Fixed-scope projects are quoted from a rate card in USD, with PKR pricing available for clients in Pakistan. Longer engagements can be billed monthly.', 'Pricing', 2),
('Do you work with early-stage startups?', 'Yes. We regularly build MVPs on tighter budgets and can phase delivery so you launch with the smallest useful product.', 'Engagement', 3),
('Who owns the code and designs?', 'You do. Full IP transfers to you on final payment, including repositories, design files and documentation.', 'Legal', 4),
('Do you offer ongoing support?', 'We offer monthly retainers covering maintenance, monitoring, small feature work and priority response times.', 'Support', 5),
('Can you work with our existing team?', 'Often. We can embed alongside in-house engineers, run code reviews and hand off with full documentation.', 'Engagement', 6);

INSERT INTO public.team_members (full_name, position, bio, skills, experience, sort_order) VALUES
('Hamza Iqbal', 'Founder & Principal Engineer', 'Leads architecture and delivery across every engagement, with a background in high-traffic commerce platforms.', ARRAY['React','Node.js','Postgres','Architecture'], '9 years', 1),
('Zara Malik', 'Head of Design', 'Turns messy requirements into clear interfaces. Previously designed products for fintech and health.', ARRAY['Product Design','Design Systems','Figma'], '7 years', 2),
('Bilal Rehman', 'AI Engineer', 'Builds retrieval and automation systems that hold up under real production load.', ARRAY['Python','LLMs','pgvector','Evals'], '6 years', 3),
('Nadia Farooq', 'Delivery Lead', 'Keeps scope, timelines and communication tight so clients always know where things stand.', ARRAY['Delivery','QA','Client Success'], '8 years', 4);
