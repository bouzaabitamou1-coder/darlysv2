
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}'::text[];

DROP VIEW IF EXISTS public.public_tenants;
CREATE VIEW public.public_tenants AS
SELECT id, slug, name, description, images, logo_url,
       primary_color, accent_color, font_display, font_body,
       concierge_name, default_currency,
       location_lat, location_lng, is_active
FROM public.tenants
WHERE is_active = true;
ALTER VIEW public.public_tenants SET (security_invoker = off);
GRANT SELECT ON public.public_tenants TO anon, authenticated;
