## Goal

Replace Lovable Cloud (Supabase) entirely with a **Laravel 11 backend + PostgreSQL database managed in pgAdmin**. The React frontend keeps its UI, but every `supabase.from(...)`, `supabase.auth.*`, and `supabase.functions.invoke(...)` call is replaced by `fetch` to your Laravel API. Auth uses **Laravel Sanctum session cookies** (httpOnly, SameSite). Backend stays **deployed** (e.g. Railway / Render / a VPS) while pgAdmin connects to that same hosted PostgreSQL database.

## Architecture

```text
[React app on Lovable]  --(fetch, credentials: include)-->  [Laravel API on Railway]
                                                                     |
                                                                     v
                                                       [PostgreSQL on Railway/Neon]
                                                                     ^
                                                                     |
                                                              [pgAdmin on your PC]
```

- pgAdmin is just a GUI client; the database lives in the cloud so the deployed Laravel and your local pgAdmin see the same data.
- Cron job inside Laravel (or `php artisan schedule:run`) replaces the `cleanup_expired_locks` and Telegram/Opera triggers.

## Phase 1 — Provision PostgreSQL + pgAdmin

1. Create a managed PostgreSQL instance (Railway, Neon, or Supabase-as-DB-only). Save the connection string.
2. In pgAdmin → Register Server → paste host, port, user, password from step 1. You can browse/edit data live.
3. Import the existing `darlys_full_db_dump.sql` (already exported earlier) into this new database via pgAdmin Query Tool.
4. Drop Supabase-only artifacts: RLS policies (Laravel will enforce auth), the `auth.*` references, the `\restrict` line.

## Phase 2 — Laravel 11 backend scaffold

Create a new repo `darlys-api/` (separate from the React project):

```bash
composer create-project laravel/laravel darlys-api
cd darlys-api
composer require laravel/sanctum stripe/stripe-php
php artisan install:api
```

`.env`:
```
DB_CONNECTION=pgsql
DB_HOST=<railway host>
DB_PORT=5432
DB_DATABASE=darlys
DB_USERNAME=...
DB_PASSWORD=...
SESSION_DRIVER=cookie
SESSION_DOMAIN=.darlys.site
SANCTUM_STATEFUL_DOMAINS=darlys.site,www.darlys.site,localhost:5173
STRIPE_SECRET=...
STRIPE_WEBHOOK_SECRET=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

Configure CORS (`config/cors.php`): `supports_credentials => true`, paths `api/*` + `sanctum/csrf-cookie`, allowed origins = your frontend domain.

## Phase 3 — Models, migrations, seeders

Generate Eloquent models matching the existing schema (don't recreate tables — point migrations at the imported DB or run `php artisan migrate:status` after writing matching migrations). One model per table:

| Model | Table |
|---|---|
| `User` | `users` (Laravel default; merge `profiles` columns into it OR keep `Profile` model) |
| `Role` (pivot) | `user_roles` |
| `Room` | `rooms` |
| `Booking` | `bookings` |
| `ContactMessage` | `contact_messages` |
| `ReservationLock` | `reservation_locks` |
| `PaymentEvent` | `payment_events` |
| `OperaSyncLog` | `opera_sync_log` |

Add a `Gate::define('admin', ...)` checking `user_roles` for the role `admin`.

## Phase 4 — REST endpoints (replaces every Supabase call)

`routes/api.php`:

```text
POST   /sanctum/csrf-cookie          (Sanctum)
POST   /api/auth/login               email + password → session cookie
POST   /api/auth/logout
GET    /api/auth/me                  current user + isAdmin

GET    /api/rooms                    list (public)
GET    /api/rooms/{slug}             detail
POST   /api/rooms                    admin create
PATCH  /api/rooms/{id}               admin update
DELETE /api/rooms/{id}               admin delete

POST   /api/bookings                 create pending booking (public)
GET    /api/bookings                 admin list / user list (own)
GET    /api/bookings/{id}            owner or admin
PATCH  /api/bookings/{id}            admin update status
POST   /api/bookings/{id}/refund     admin → Stripe refund

POST   /api/availability             { roomId, checkIn, checkOut } → { available }
POST   /api/checkout                 create Stripe Checkout Session, return url
POST   /api/stripe/webhook           Stripe → updates booking + payment_events

POST   /api/contact                  public contact form
GET    /api/contact                  admin list
PATCH  /api/contact/{id}             admin mark read

GET    /api/admin/opera-logs         admin
POST   /api/admin/opera-sync         admin (stub)
POST   /api/admin/bootstrap          one-time, gated by header secret
```

Controllers map 1:1 with the existing edge functions (`create-checkout`, `stripe-webhook`, `check-availability`, `opera-sync`, `process-refund`, `admin-bootstrap`). The `cleanup_expired_locks` SQL function stays in Postgres and is called from `App\Console\Kernel` every minute.

Telegram notification: keep inside `CheckoutController@store`, use `Http::post('https://api.telegram.org/bot{TOKEN}/sendMessage', [...])` — no more Lovable connector.

## Phase 5 — React frontend changes

Add `src/lib/api.ts`:
```ts
const BASE = import.meta.env.VITE_API_URL; // https://api.darlys.site
export async function api(path: string, init: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...(init.headers||{}) },
    ...init,
  });
  if (!res.ok) throw new Error((await res.json()).message ?? res.statusText);
  return res.json();
}
export async function ensureCsrf() { await fetch(`${BASE}/sanctum/csrf-cookie`, { credentials: "include" }); }
```

Then mechanically replace, file by file:

| Current call | New call |
|---|---|
| `supabase.from("rooms").select(...)` | `api("/api/rooms")` |
| `supabase.from("bookings").insert(b)` | `api("/api/bookings", { method:"POST", body: JSON.stringify(b) })` |
| `supabase.auth.signInWithPassword(...)` | `await ensureCsrf(); api("/api/auth/login", { method:"POST", body:... })` |
| `supabase.auth.signOut()` | `api("/api/auth/logout", { method:"POST" })` |
| `supabase.auth.onAuthStateChange` | `useQuery("/api/auth/me")` polled / on mount |
| `supabase.functions.invoke("create-checkout", { body })` | `api("/api/checkout", { method:"POST", body: JSON.stringify(body) })` |
| `supabase.functions.invoke("check-availability", ...)` | `api("/api/availability", ...)` |
| `supabase.functions.invoke("admin-bootstrap", ...)` | `api("/api/admin/bootstrap", ...)` |

Files to edit (every one of these imports `@/integrations/supabase/client`):
- `src/hooks/useAuth.tsx` — rewrite around `/api/auth/me`, `/login`, `/logout`
- `src/pages/AdminLogin.tsx`, `AdminBootstrap.tsx`, `AdminDashboard.tsx`
- `src/pages/Rooms.tsx`, `BookingPage.tsx`, `BookingConfirmation.tsx`, `Contact.tsx`
- Anything else that still imports `supabase`

Delete:
- `src/integrations/supabase/` folder
- `supabase/` folder (functions + config + migrations)
- `@supabase/supabase-js` from `package.json`

Add `VITE_API_URL` to your Lovable project env vars.

## Phase 6 — Deploy

1. Push `darlys-api/` to GitHub.
2. Deploy on **Railway** (one click for Laravel + Postgres) or Render. Bind the same Postgres instance pgAdmin connects to.
3. Point a subdomain `api.darlys.site` at the Laravel deploy.
4. Update React `VITE_API_URL=https://api.darlys.site` and republish from Lovable.
5. Configure Stripe webhook → `https://api.darlys.site/api/stripe/webhook`.

## Phase 7 — Cleanup & verification

- Smoke test: load rooms, create a booking, complete Stripe test payment, confirm webhook updates `payment_status`, log in as admin, view dashboard, refund a booking.
- In pgAdmin: verify rows appear in `bookings`, `payment_events`, `opera_sync_log`.
- Disable Lovable Cloud once confident (irreversible — keep the SQL dump as a backup).

## What you need to provide before we start coding

1. PostgreSQL connection string (from Railway/Neon) so Laravel + pgAdmin can both connect.
2. Where to deploy Laravel (Railway recommended for a uni project — free tier, auto-deploy from GitHub).
3. Domain plan: `api.darlys.site` for the API, keep `darlys.site` for the React app.

## Risks / heads-up

- **Lovable cannot host Laravel/PHP.** The Laravel app must live in a separate repo and a separate host. Lovable will only continue to host the React frontend.
- Losing Supabase RLS means **every** API endpoint must enforce auth/ownership in Laravel — easy to forget. Plan includes a Policy class per model.
- Stripe webhook secret will change (new endpoint URL) — you'll regenerate it in Stripe dashboard.
- Email auth confirmation, password reset, OAuth — Supabase handled these for free; in Laravel you'll wire them via `laravel/breeze` or a transactional email provider (Resend/Mailgun).
