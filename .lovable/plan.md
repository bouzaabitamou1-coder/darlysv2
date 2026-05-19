
# Multi-Tenant Platform — Implementation Plan

Dar Lys becomes tenant #1 on a platform that can host other riads/hotels. Admins create tenants manually. The concierge widget is delivered two ways: an embeddable `<script>` snippet for external sites, and per-tenant subdomains (`riad-x.darlys.site`) for hosted pages.

## 1. Database schema (migration)

New table `tenants`:
- `id uuid pk`
- `slug text unique` (used in subdomain + embed)
- `name text`
- `contact_email text`
- `phone text`, `address text`, `location_lat numeric`, `location_lng numeric`
- Branding: `logo_url`, `primary_color`, `accent_color`, `font_display`, `font_body`
- Concierge: `concierge_name` (default "Lys"), `concierge_persona text`, `faq text`, `driver_rate_per_km numeric`, `default_currency text`
- `allowed_origins text[]` (CORS whitelist for embed snippet)
- `is_active boolean`, `created_at`, `updated_at`

New table `tenant_members`:
- `tenant_id uuid`, `user_id uuid`, `role text` ('owner' | 'admin' | 'staff')
- unique(tenant_id, user_id)

Add `tenant_id uuid not null` (FK → tenants) to:
- `rooms`, `bookings`, `transport_bookings`, `contact_messages`,
  `opera_sync_log`, `payment_events`, `reservation_locks`, `stay_surveys`

New enum value in `app_role`: `super_admin` (platform-level, can manage all tenants). Existing `admin` becomes scoped: tenant admin.

Helper functions (security definer):
- `current_tenant_id()` — reads `request.jwt.claim.tenant_id` or session GUC
- `is_tenant_member(_tenant_id uuid, _user_id uuid)` — checks `tenant_members`
- `is_tenant_admin(_tenant_id, _user_id)` — role in ('owner','admin')
- `is_super_admin(_user_id)` — checks `user_roles`

Bootstrap: insert Dar Lys as tenant #1; backfill `tenant_id` on every existing row to that id.

## 2. RLS rewrite (every tenant-scoped table)

- SELECT: public read on `rooms` filtered by `tenant_id` from request context; `bookings` etc. limited to `auth.uid() = user_id` OR `is_tenant_admin(tenant_id, auth.uid())` OR `is_super_admin`.
- INSERT/UPDATE/DELETE: must match a tenant the user belongs to, or super_admin.
- `tenants`: super_admin full access; members read their own tenant; tenant admins update their own.
- `tenant_members`: super_admin + tenant owner manage; users see their own memberships.

## 3. Tenant resolution

`src/lib/tenant.ts`: resolves the active tenant in this priority order:
1. Subdomain (`riad-x.darlys.site` → slug `riad-x`)
2. Query param `?tenant=slug` (for previews)
3. Default to `dar-lys` on apex / `darlys.site`

`TenantProvider` (React context) fetches tenant row by slug, exposes `tenant`, applies branding via CSS variables (`--primary`, `--accent`, fonts) at the document root, and gates routes.

## 4. Concierge edge function (multi-tenant)

`supabase/functions/concierge-ai/index.ts`:
- Accepts `{ messages, lang, tenantSlug }`
- Validates Origin against `tenants.allowed_origins` (for embed); same-origin requests on darlys.site auto-allow
- Loads tenant row + that tenant's rooms + FAQ + driver rate
- Builds system prompt from tenant fields (name, persona, FAQ, driver rate, coords)
- Returns reply + sets per-tenant CORS header

## 5. Embeddable widget

New `public/embed/concierge.js` (vanilla JS, no React, ~6KB):
- Read `data-tenant` from its own `<script>` tag
- Inject floating button + chat iframe pointing to `https://darlys.site/embed/concierge?tenant=<slug>`
- Self-contained, themes via tenant branding fetched once

New route `/embed/concierge` renders only `ConciergeChat` in tenant theme (no header/footer).

Snippet shown in tenant dashboard:
```
<script src="https://darlys.site/embed/concierge.js" data-tenant="riad-x" async></script>
```

## 6. Super-admin pages

`/super-admin` (gated by `is_super_admin`):
- List tenants, create new tenant (slug, name, branding, allowed_origins, owner email)
- "Impersonate / view as" link → opens `?tenant=slug`
- Embed snippet generator per tenant

Existing `/admin` becomes per-tenant: queries filtered by `current_tenant_id()`.

## 7. Subdomain routing

DNS: wildcard `*.darlys.site → 185.158.133.1` (user adds manually). Document this in a short README section. The app already responds on any host; `tenant.ts` parses subdomain client-side, so no server-side routing change needed.

## 8. Edge functions update

Add `tenantId` to body / derive from JWT in: `create-checkout`, `stripe-webhook`, `process-refund`, `check-availability`, `opera-sync`. Each must scope its DB reads/writes by `tenant_id`.

## Technical notes

- Migration is large but additive; backfill query: `UPDATE rooms SET tenant_id = '<dar-lys-id>' WHERE tenant_id IS NULL;` etc. for each table, then set NOT NULL.
- CSS variables driven by `TenantProvider`: writes `document.documentElement.style.setProperty('--primary', tenant.primary_color)` etc., overriding `index.css` defaults at runtime.
- Fonts: tenant picks from a curated allowlist of Google Fonts to avoid arbitrary CSS injection.
- `allowed_origins` validated server-side in concierge fn before reflecting `Access-Control-Allow-Origin`.
- Stripe per-tenant keys are out of scope for v1; platform uses a single Stripe account, bookings tagged by tenant_id.

## Out of scope (v1)

- Self-serve tenant signup
- Per-tenant Stripe Connect / payouts
- Per-tenant domains (only subdomain + embed)
- Billing tenants for usage
