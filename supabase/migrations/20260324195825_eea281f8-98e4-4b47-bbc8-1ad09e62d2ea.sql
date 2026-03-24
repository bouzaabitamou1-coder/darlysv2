-- Drop the permissive policies
DROP POLICY "Anyone can create bookings" ON public.bookings;
DROP POLICY "Anyone can submit contact messages" ON public.contact_messages;

-- Recreate with basic validation (non-empty required fields)
CREATE POLICY "Authenticated or anonymous can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (
    guest_name IS NOT NULL AND guest_name != '' AND
    guest_email IS NOT NULL AND guest_email != '' AND
    check_in IS NOT NULL AND check_out IS NOT NULL AND
    total_price > 0
  );

CREATE POLICY "Anyone can submit contact messages with content" ON public.contact_messages
  FOR INSERT WITH CHECK (
    name IS NOT NULL AND name != '' AND
    email IS NOT NULL AND email != '' AND
    message IS NOT NULL AND message != ''
  );