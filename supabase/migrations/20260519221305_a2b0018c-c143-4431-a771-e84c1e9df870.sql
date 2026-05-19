
-- 1. Restrict stay_surveys SELECT to tenant admins; expose safe columns via public view
DROP POLICY IF EXISTS "Anyone can view stay surveys" ON public.stay_surveys;

CREATE POLICY "Tenant admins view surveys"
ON public.stay_surveys FOR SELECT
USING (is_tenant_admin(tenant_id, auth.uid()) OR is_super_admin(auth.uid()));

CREATE OR REPLACE VIEW public.public_stay_surveys
WITH (security_invoker = true) AS
SELECT id, guest_name, overall_rating, cleanliness, service, comfort, food,
       would_recommend, comments, photo_url, created_at, tenant_id
FROM public.stay_surveys;

-- Allow anon/auth to read the view (RLS on base table would block; use security definer wrapper instead)
DROP VIEW IF EXISTS public.public_stay_surveys;
CREATE VIEW public.public_stay_surveys AS
SELECT id, guest_name, overall_rating, cleanliness, service, comfort, food,
       would_recommend, comments, photo_url, created_at, tenant_id
FROM public.stay_surveys;
ALTER VIEW public.public_stay_surveys SET (security_invoker = off);
GRANT SELECT ON public.public_stay_surveys TO anon, authenticated;

-- 2. Restrict tenants SELECT; expose safe branding via view
DROP POLICY IF EXISTS "Anyone can view active tenants public info" ON public.tenants;

CREATE POLICY "Members and super admins view tenants"
ON public.tenants FOR SELECT
USING (is_super_admin(auth.uid()) OR is_tenant_member(id, auth.uid()));

CREATE OR REPLACE VIEW public.public_tenants AS
SELECT id, slug, name, logo_url, primary_color, accent_color,
       font_display, font_body, concierge_name, default_currency,
       location_lat, location_lng, is_active
FROM public.tenants
WHERE is_active = true;
ALTER VIEW public.public_tenants SET (security_invoker = off);
GRANT SELECT ON public.public_tenants TO anon, authenticated;

-- 3. Storage hardening for survey-photos
-- Drop broad SELECT (listing) policy; public bucket URLs still work for direct fetch
DROP POLICY IF EXISTS "Public can view survey photos" ON storage.objects;

-- Tighten upload policy: image extensions only
DROP POLICY IF EXISTS "Anyone can upload survey photos" ON storage.objects;
CREATE POLICY "Anyone can upload survey photo images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'survey-photos'
  AND lower(storage.extension(name)) = ANY (ARRAY['jpg','jpeg','png','webp','heic'])
);

-- Enforce size + MIME at bucket level (5 MB)
UPDATE storage.buckets
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/heic']
WHERE id = 'survey-photos';
