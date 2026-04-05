-- Enable btree_gist for exclusion constraints on ranges
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Add new columns to bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
  ADD COLUMN IF NOT EXISTS opera_confirmation_number TEXT;

-- Double-booking prevention: exclusion constraint using daterange
-- Note: check_in and check_out are DATE columns; we cast them for the constraint
ALTER TABLE public.bookings
  ADD CONSTRAINT no_double_booking
  EXCLUDE USING gist (
    room_id WITH =,
    daterange(check_in, check_out, '[)') WITH &&
  )
  WHERE (status IN ('pending', 'confirmed'));

-- Reservation locks table (temporary holds during checkout)
CREATE TABLE public.reservation_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  session_id TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '15 minutes'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reservation_locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create locks"
  ON public.reservation_locks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view locks"
  ON public.reservation_locks FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage locks"
  ON public.reservation_locks FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Payment events audit table
CREATE TABLE public.payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view payment events"
  ON public.payment_events FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service can insert payment events"
  ON public.payment_events FOR INSERT
  WITH CHECK (true);

-- Opera PMS sync log
CREATE TABLE public.opera_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  request_payload JSONB,
  response_payload JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.opera_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view sync logs"
  ON public.opera_sync_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service can insert sync logs"
  ON public.opera_sync_log FOR INSERT
  WITH CHECK (true);

-- Function: check room availability
CREATE OR REPLACE FUNCTION public.check_availability(
  _room_id UUID, _check_in DATE, _check_out DATE
) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.bookings
    WHERE room_id = _room_id
      AND status IN ('pending', 'confirmed')
      AND daterange(check_in, check_out, '[)') && daterange(_check_in, _check_out, '[)')
  ) AND NOT EXISTS (
    SELECT 1 FROM public.reservation_locks
    WHERE room_id = _room_id
      AND expires_at > now()
      AND daterange(check_in, check_out, '[)') && daterange(_check_in, _check_out, '[)')
  );
$$;

-- Function: cleanup expired locks
CREATE OR REPLACE FUNCTION public.cleanup_expired_locks()
RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  DELETE FROM public.reservation_locks WHERE expires_at < now();
$$;