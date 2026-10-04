DROP FUNCTION IF EXISTS public.claim_first_admin();

REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;