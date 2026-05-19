
ALTER TABLE public.stay_surveys ADD COLUMN IF NOT EXISTS photo_url text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('survey-photos', 'survey-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view survey photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'survey-photos');

CREATE POLICY "Anyone can upload survey photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'survey-photos');

CREATE POLICY "Admins can delete survey photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'survey-photos' AND has_role(auth.uid(), 'admin'));
