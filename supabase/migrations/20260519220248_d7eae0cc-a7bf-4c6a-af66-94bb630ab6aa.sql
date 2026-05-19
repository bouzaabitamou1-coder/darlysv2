
-- ============================================================
-- TENANTS TABLE
-- ============================================================
CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  contact_email text,
  phone text,
  address text,
  location_lat numeric,
  location_lng numeric,
  logo_url text,
  primary_color text DEFAULT '#1e3a5f',
  accent_color text DEFAULT '#c9a84c',
  font_display text DEFAULT 'Playfair Display',
  font_body text DEFAULT 'Cormorant Garamond',
  concierge_name text DEFAULT 'Lys',
  concierge_persona text,
  faq text,
  driver_rate_per_km numeric DEFAULT 10,
  default_currency text DEFAULT 'MAD',
  allowed_origins text[] DEFAULT '{}'::text[],
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tenants_slug ON public.tenants(slug);
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- TENANT MEMBERS
-- ============================================================
CREATE TABLE public.tenant_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('owner','admin','staff')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

CREATE INDEX idx_tenant_members_user ON public.tenant_members(user_id);
CREATE INDEX idx_tenant_members_tenant ON public.tenant_members(tenant_id);
ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTIONS (SECURITY DEFINER, restricted EXECUTE)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'::app_role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_tenant_member(_tenant_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_members
    WHERE tenant_id = _tenant_id AND user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_tenant_admin(_tenant_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_members
    WHERE tenant_id = _tenant_id AND user_id = _user_id AND role IN ('owner','admin')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_tenant_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_tenant_admin(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_tenant_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_tenant_admin(uuid, uuid) TO authenticated;

-- ============================================================
-- BOOTSTRAP DAR LYS AS TENANT #1 (deterministic UUID)
-- ============================================================
INSERT INTO public.tenants (
  id, slug, name, contact_email, phone, address, location_lat, location_lng,
  primary_color, accent_color, concierge_name, driver_rate_per_km, default_currency,
  allowed_origins, faq
) VALUES (
  '00000000-0000-0000-0000-00000000da75',
  'dar-lys',
  'Dar Lys',
  'contact@darlys.site',
  '+212 535 366 423',
  'Medina of Fès, Morocco',
  34.0625,
  -4.9745,
  '#1e3a5f',
  '#c9a84c',
  'Lys',
  10,
  'MAD',
  ARRAY['https://darlys.site','https://www.darlys.site','https://darlysv2.lovable.app'],
  'Cancellation: Free up to 7 days before check-in. Within 7 days: 50% of first night. No-show: full first night.
Breakfast: Traditional Moroccan breakfast included with every room.
Dietary: Vegetarian, vegan, gluten-free, halal available with 24h notice.
Private events: Riad privatization possible up to 30 guests.
Families: Welcome; extra beds & cribs available; open courtyard with fountain.
Cooking class: Daily 10:00, 60€/person, book 24h ahead.
Languages spoken: Arabic, French, English, some Spanish/Italian.
Airport transfer: Fès-Saïss airport ~15km, private transfer 25€/way.'
);

-- ============================================================
-- ADD tenant_id TO EXISTING TABLES, BACKFILL, MAKE NOT NULL
-- ============================================================
DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY['rooms','bookings','transport_bookings','contact_messages',
                         'opera_sync_log','payment_events','reservation_locks','stay_surveys'];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE', tbl);
    EXECUTE format('UPDATE public.%I SET tenant_id = %L', tbl, '00000000-0000-0000-0000-00000000da75');
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN tenant_id SET NOT NULL', tbl);
    EXECUTE format('CREATE INDEX idx_%I_tenant ON public.%I(tenant_id)', tbl, tbl);
  END LOOP;
END $$;

-- ============================================================
-- RLS: TENANTS
-- ============================================================
CREATE POLICY "Anyone can view active tenants public info"
  ON public.tenants FOR SELECT
  USING (is_active = true);

CREATE POLICY "Super admins manage tenants"
  ON public.tenants FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins can update their tenant"
  ON public.tenants FOR UPDATE
  TO authenticated
  USING (public.is_tenant_admin(id, auth.uid()))
  WITH CHECK (public.is_tenant_admin(id, auth.uid()));

-- ============================================================
-- RLS: TENANT MEMBERS
-- ============================================================
CREATE POLICY "Users see own memberships"
  ON public.tenant_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_tenant_admin(tenant_id, auth.uid()) OR public.is_super_admin(auth.uid()));

CREATE POLICY "Tenant owners & super admins manage members"
  ON public.tenant_members FOR ALL
  TO authenticated
  USING (
    public.is_super_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.tenant_members tm
               WHERE tm.tenant_id = tenant_members.tenant_id
                 AND tm.user_id = auth.uid() AND tm.role = 'owner')
  )
  WITH CHECK (
    public.is_super_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.tenant_members tm
               WHERE tm.tenant_id = tenant_members.tenant_id
                 AND tm.user_id = auth.uid() AND tm.role = 'owner')
  );

-- ============================================================
-- REPLACE RLS ON TENANT-SCOPED TABLES
-- ============================================================

-- ROOMS: public can read, tenant admins or super admin manage
DROP POLICY IF EXISTS "Admins can manage rooms" ON public.rooms;
DROP POLICY IF EXISTS "Rooms are viewable by everyone" ON public.rooms;
CREATE POLICY "Rooms viewable by everyone" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Tenant admins manage rooms" ON public.rooms FOR ALL
  TO authenticated
  USING (public.is_tenant_admin(tenant_id, auth.uid()) OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_tenant_admin(tenant_id, auth.uid()) OR public.is_super_admin(auth.uid()));

-- BOOKINGS
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
CREATE POLICY "Users view own bookings" ON public.bookings FOR SELECT
  USING (auth.uid() = user_id OR public.is_tenant_admin(tenant_id, auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY "Anyone can create bookings" ON public.bookings FOR INSERT
  WITH CHECK (
    guest_name IS NOT NULL AND guest_name <> '' AND
    guest_email IS NOT NULL AND guest_email <> '' AND
    check_in IS NOT NULL AND check_out IS NOT NULL AND
    total_price > 0 AND (user_id IS NULL OR user_id = auth.uid()) AND
    tenant_id IS NOT NULL
  );
CREATE POLICY "Tenant admins manage bookings" ON public.bookings FOR ALL
  TO authenticated
  USING (public.is_tenant_admin(tenant_id, auth.uid()) OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_tenant_admin(tenant_id, auth.uid()) OR public.is_super_admin(auth.uid()));

-- TRANSPORT BOOKINGS
DROP POLICY IF EXISTS "Admins can manage all transport bookings" ON public.transport_bookings;
DROP POLICY IF EXISTS "Anyone can create transport bookings" ON public.transport_bookings;
DROP POLICY IF EXISTS "Users can view own transport bookings" ON public.transport_bookings;
CREATE POLICY "Users view own transport bookings" ON public.transport_bookings FOR SELECT
  USING (auth.uid() = user_id OR public.is_tenant_admin(tenant_id, auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY "Anyone can create transport bookings" ON public.transport_bookings FOR INSERT
  WITH CHECK (
    guest_name IS NOT NULL AND guest_name <> '' AND
    guest_email IS NOT NULL AND guest_email <> '' AND
    pickup_address IS NOT NULL AND pickup_address <> '' AND
    pickup_datetime IS NOT NULL AND
    (user_id IS NULL OR user_id = auth.uid()) AND tenant_id IS NOT NULL
  );
CREATE POLICY "Tenant admins manage transport bookings" ON public.transport_bookings FOR ALL
  TO authenticated
  USING (public.is_tenant_admin(tenant_id, auth.uid()) OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_tenant_admin(tenant_id, auth.uid()) OR public.is_super_admin(auth.uid()));

-- CONTACT MESSAGES
DROP POLICY IF EXISTS "Admins can update messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can view messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Anyone can submit contact messages with content" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact messages" ON public.contact_messages FOR INSERT
  WITH CHECK (
    name IS NOT NULL AND name <> '' AND
    email IS NOT NULL AND email <> '' AND
    message IS NOT NULL AND message <> '' AND
    tenant_id IS NOT NULL
  );
CREATE POLICY "Tenant admins view messages" ON public.contact_messages FOR SELECT
  TO authenticated
  USING (public.is_tenant_admin(tenant_id, auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY "Tenant admins update messages" ON public.contact_messages FOR UPDATE
  TO authenticated
  USING (public.is_tenant_admin(tenant_id, auth.uid()) OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_tenant_admin(tenant_id, auth.uid()) OR public.is_super_admin(auth.uid()));

-- OPERA SYNC LOG
DROP POLICY IF EXISTS "Admins can view sync logs" ON public.opera_sync_log;
CREATE POLICY "Tenant admins view sync logs" ON public.opera_sync_log FOR SELECT
  TO authenticated
  USING (public.is_tenant_admin(tenant_id, auth.uid()) OR public.is_super_admin(auth.uid()));

-- PAYMENT EVENTS
DROP POLICY IF EXISTS "Admins can view payment events" ON public.payment_events;
CREATE POLICY "Tenant admins view payment events" ON public.payment_events FOR SELECT
  TO authenticated
  USING (public.is_tenant_admin(tenant_id, auth.uid()) OR public.is_super_admin(auth.uid()));

-- RESERVATION LOCKS
DROP POLICY IF EXISTS "Admins can manage locks" ON public.reservation_locks;
DROP POLICY IF EXISTS "Admins can view locks" ON public.reservation_locks;
DROP POLICY IF EXISTS "Anyone can create locks" ON public.reservation_locks;
CREATE POLICY "Anyone can create reservation locks" ON public.reservation_locks FOR INSERT
  WITH CHECK (tenant_id IS NOT NULL);
CREATE POLICY "Tenant admins view locks" ON public.reservation_locks FOR SELECT
  TO authenticated
  USING (public.is_tenant_admin(tenant_id, auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY "Tenant admins manage locks" ON public.reservation_locks FOR DELETE
  TO authenticated
  USING (public.is_tenant_admin(tenant_id, auth.uid()) OR public.is_super_admin(auth.uid()));

-- STAY SURVEYS
DROP POLICY IF EXISTS "Admins can delete surveys" ON public.stay_surveys;
DROP POLICY IF EXISTS "Admins can view surveys" ON public.stay_surveys;
DROP POLICY IF EXISTS "Anyone can submit a stay survey" ON public.stay_surveys;
DROP POLICY IF EXISTS "Anyone can view stay surveys" ON public.stay_surveys;
CREATE POLICY "Anyone can view stay surveys" ON public.stay_surveys FOR SELECT USING (true);
CREATE POLICY "Anyone can submit a stay survey" ON public.stay_surveys FOR INSERT
  WITH CHECK (
    guest_email IS NOT NULL AND guest_email <> '' AND
    overall_rating BETWEEN 1 AND 5 AND tenant_id IS NOT NULL
  );
CREATE POLICY "Tenant admins delete surveys" ON public.stay_surveys FOR DELETE
  TO authenticated
  USING (public.is_tenant_admin(tenant_id, auth.uid()) OR public.is_super_admin(auth.uid()));
