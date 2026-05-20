CREATE OR REPLACE FUNCTION public.get_room_unavailable_ranges(_room_id uuid)
RETURNS TABLE(check_in date, check_out date)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT check_in, check_out
  FROM public.bookings
  WHERE room_id = _room_id
    AND status IN ('pending', 'confirmed')
    AND check_out >= CURRENT_DATE
  UNION ALL
  SELECT check_in, check_out
  FROM public.reservation_locks
  WHERE room_id = _room_id
    AND expires_at > now();
$$;

GRANT EXECUTE ON FUNCTION public.get_room_unavailable_ranges(uuid) TO anon, authenticated;