CREATE TABLE public.pricing_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text,
  base_price_usd numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'fixed',
  is_addon boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  locale text NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pricing_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pricing_items TO authenticated;
GRANT ALL ON public.pricing_items TO service_role;
ALTER TABLE public.pricing_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published pricing items" ON public.pricing_items FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admins manage pricing items" ON public.pricing_items FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER pricing_items_updated_at BEFORE UPDATE ON public.pricing_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usd_to_pkr_rate numeric NOT NULL DEFAULT 278.50,
  last_rate_updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read site settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage site settings" ON public.site_settings FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  project_type text,
  budget_range text,
  timeline text,
  message text,
  selected_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  estimated_total numeric,
  currency text NOT NULL DEFAULT 'USD',
  source text NOT NULL DEFAULT 'contact_form',
  status text NOT NULL DEFAULT 'New',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a lead" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read leads" ON public.leads FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update leads" ON public.leads FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete leads" ON public.leads FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_settings (usd_to_pkr_rate) VALUES (278.50);

INSERT INTO public.pricing_items (name, category, description, base_price_usd, unit, is_addon, sort_order) VALUES
('Landing Page', 'Web', 'Single high-converting marketing page with CMS-editable sections.', 900, 'fixed', false, 1),
('Business Website (5 pages)', 'Web', 'Multi-page marketing site with blog, forms and SEO setup.', 2400, 'fixed', false, 2),
('Web Application (MVP)', 'Web', 'Custom product MVP with auth, database and dashboard.', 7500, 'fixed', false, 3),
('E-commerce Store', 'Web', 'Storefront, cart, checkout and payment integration.', 5200, 'fixed', false, 4),
('Mobile App (iOS + Android)', 'Mobile', 'Cross-platform app with API integration and store submission.', 9500, 'fixed', false, 5),
('AI Chatbot / Assistant', 'AI', 'Custom assistant trained on your content, embedded in your product.', 3200, 'fixed', false, 6),
('Brand Identity Package', 'Design', 'Logo, palette, typography and brand guidelines.', 1400, 'fixed', false, 7),
('UI/UX Design System', 'Design', 'Component library and design tokens for consistent product UI.', 2200, 'fixed', false, 8),
('Extra Page', 'Web', 'Additional designed and built page.', 220, 'per_page', true, 20),
('SEO Setup & Optimisation', 'Growth', 'Technical SEO, metadata, sitemap and analytics wiring.', 650, 'fixed', true, 21),
('Payment Gateway Integration', 'Web', 'Stripe, JazzCash or Easypaisa checkout integration.', 800, 'fixed', true, 22),
('Multi-language Support', 'Web', 'Localisation setup with translated content structure.', 950, 'fixed', true, 23),
('Admin Dashboard', 'Web', 'Internal dashboard to manage content, users and orders.', 1800, 'fixed', true, 24),
('Monthly Maintenance', 'Support', 'Ongoing updates, monitoring and priority support.', 400, 'monthly', true, 25),
('Priority Delivery (rush)', 'Support', 'Compressed timeline with dedicated team allocation.', 1200, 'fixed', true, 26),
('Content Writing', 'Growth', 'Professional copy for pages and product sections.', 350, 'fixed', true, 27);