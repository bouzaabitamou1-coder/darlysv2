
-- Fix: user_roles privilege escalation
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can select roles" ON public.user_roles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix: payment_events public insert (edge functions use service role and bypass RLS)
DROP POLICY IF EXISTS "Service can insert payment events" ON public.payment_events;

-- Fix: opera_sync_log public insert (edge functions use service role and bypass RLS)
DROP POLICY IF EXISTS "Service can insert sync logs" ON public.opera_sync_log;

-- Fix: reservation_locks enumeration - restrict SELECT to admins only.
-- check_availability() is SECURITY DEFINER and reads locks server-side, so clients don't need direct SELECT.
DROP POLICY IF EXISTS "Anyone can view locks" ON public.reservation_locks;
CREATE POLICY "Admins can view locks" ON public.reservation_locks FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
