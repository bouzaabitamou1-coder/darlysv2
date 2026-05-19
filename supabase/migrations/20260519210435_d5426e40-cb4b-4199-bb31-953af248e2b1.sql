-- Add identity fields to bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS family_name text,
  ADD COLUMN IF NOT EXISTS id_document text;

-- Guest stay surveys
CREATE TABLE IF NOT EXISTS public.stay_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid,
  guest_name text,
  guest_email text NOT NULL,
  overall_rating int NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  cleanliness int CHECK (cleanliness BETWEEN 1 AND 5),
  service int CHECK (service BETWEEN 1 AND 5),
  comfort int CHECK (comfort BETWEEN 1 AND 5),
  food int CHECK (food BETWEEN 1 AND 5),
  would_recommend boolean,
  comments text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stay_surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a stay survey"
ON public.stay_surveys
FOR INSERT
TO anon, authenticated
WITH CHECK (
  guest_email IS NOT NULL AND guest_email <> ''
  AND overall_rating BETWEEN 1 AND 5
);

CREATE POLICY "Admins can view surveys"
ON public.stay_surveys
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete surveys"
ON public.stay_surveys
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));