ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS allow_cross_recommendations boolean NOT NULL DEFAULT false;

DROP VIEW IF EXISTS public.public_tenants;
CREATE VIEW public.public_tenants
WITH (security_invoker = true)
AS
SELECT
  id, slug, name, description, images, contact_email, phone, address,
  location_lat, location_lng, logo_url,
  primary_color, accent_color, font_display, font_body,
  concierge_name, default_currency, is_active,
  allow_cross_recommendations
FROM public.tenants
WHERE is_active = true;

GRANT SELECT ON public.public_tenants TO anon, authenticated;