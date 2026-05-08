
DROP POLICY IF EXISTS "Authenticated or anonymous can create bookings" ON public.bookings;

CREATE POLICY "Anyone can create bookings"
ON public.bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (
  guest_name IS NOT NULL AND guest_name <> ''
  AND guest_email IS NOT NULL AND guest_email <> ''
  AND check_in IS NOT NULL
  AND check_out IS NOT NULL
  AND total_price > 0
  AND (user_id IS NULL OR user_id = auth.uid())
);
