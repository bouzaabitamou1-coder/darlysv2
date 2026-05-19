
CREATE TABLE public.transport_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  booking_id UUID,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  pickup_address TEXT NOT NULL,
  pickup_lat NUMERIC,
  pickup_lng NUMERIC,
  pickup_datetime TIMESTAMPTZ NOT NULL,
  distance_km NUMERIC NOT NULL DEFAULT 0,
  estimated_fee_dh NUMERIC NOT NULL DEFAULT 0,
  passengers INTEGER NOT NULL DEFAULT 1,
  flight_or_train_no TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transport_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create transport bookings"
ON public.transport_bookings FOR INSERT
TO anon, authenticated
WITH CHECK (
  guest_name IS NOT NULL AND guest_name <> ''
  AND guest_email IS NOT NULL AND guest_email <> ''
  AND pickup_address IS NOT NULL AND pickup_address <> ''
  AND pickup_datetime IS NOT NULL
  AND (user_id IS NULL OR user_id = auth.uid())
);

CREATE POLICY "Users can view own transport bookings"
ON public.transport_bookings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all transport bookings"
ON public.transport_bookings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_transport_bookings_updated_at
BEFORE UPDATE ON public.transport_bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_transport_bookings_pickup ON public.transport_bookings(pickup_datetime DESC);
CREATE INDEX idx_transport_bookings_booking ON public.transport_bookings(booking_id);
