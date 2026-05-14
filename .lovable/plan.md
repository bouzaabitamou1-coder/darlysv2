# Rewrite Dar Lys: React frontend + Laravel backend

Goal: keep the existing React UI, replace the entire Supabase backend (database, auth, edge functions) with a Laravel 11 API + PostgreSQL managed in pgAdmin. Nothing Supabase remains in the final codebase.

## What stays

- All React pages, components, hooks, Tailwind/shadcn UI, routes, i18n, assets.
- All business logic shapes (rooms, bookings, contact, opera logs, refunds).
- Stripe + Telegram + Opera PMS integrations (ported to Laravel).

## What changes

| Layer | Before | After |
|---|---|---|
| DB | Supabase Postgres + RLS | Self-hosted PostgreSQL (Railway/Neon), managed in pgAdmin, auth enforced in Laravel controllers |
| Auth | `supabase.auth` (JWT, localStorage) | Laravel Sanctum, session cookies, `/api/auth/*` |
| API | `supabase.from(...)` direct queries | `fetch('/api/...')` via `src/lib/api.ts` |
| Edge functions | 5 Deno functions in `supabase/functions/` | 5 Laravel controllers in `darlys-api/` |
| Storage | Supabase Storage (none used) | n/a |
| Realtime | none used | n/a |

## Architecture after rewrite

```text
 Browser (React SPA, darlys.site)
   │  fetch(credentials:'include')
   ▼
 Laravel 11 API (api.darlys.site)
   │  Eloquent
   ▼
 PostgreSQL (Railway, viewed in pgAdmin)
   │
   ├── Stripe webhook  →  POST /api/stripe/webhook
   ├── Telegram        →  outbound from Laravel
   └── Opera PMS stub  →  POST /api/admin/opera-sync
```

## Work breakdown

### 1. Backend — finish Laravel scaffold (`darlys-api/`)
The skeleton already exists (controllers, models, routes). Complete it:
- Wrap in a real Laravel 11 install (`composer create-project laravel/laravel`), merge our `app/` and `routes/` over it.
- Add `laravel/sanctum`, `stripe/stripe-php`, `guzzlehttp/guzzle`.
- Configure `config/cors.php` (allow `darlys.site`, credentials), `config/sanctum.php` (stateful domain), `config/session.php` (`SAME_SITE=none`, `SECURE=true`, domain `.darlys.site`).
- Migrations matching current Supabase schema: `rooms`, `bookings`, `contact_messages`, `payment_events`, `opera_sync_log`, `reservation_locks`, `profiles`, `user_roles`, `users` (Laravel default + `password` column for Sanctum login).
- Seed: import `darlys_full_db_dump.sql` minus `auth.*` and Supabase-only objects, OR run fresh migrations + seeders.
- Authorization: replace RLS with controller-level `Admin::check()` gate (already stubbed) and `auth:sanctum` middleware (already wired in `routes/api.php`).
- Port edge function logic 1:1:
  - `create-checkout` → `CheckoutController@create` (Stripe Checkout + Telegram alert + reservation lock)
  - `stripe-webhook` → `StripeWebhookController@handle` (signature verify, mark booking paid, Opera sync, Telegram)
  - `check-availability` → `AvailabilityController@check`
  - `process-refund` → `RefundController@process`
  - `opera-sync` → `OperaController@sync` (stub mode + JSON log)
  - `admin-bootstrap` → `AdminBootstrapController@run` (header secret)

### 2. Database — Postgres on Railway, browsed in pgAdmin
- Provision Postgres on Railway (or Neon).
- Connect pgAdmin to the public connection string for inspection.
- Run `php artisan migrate --seed` against it.

### 3. Frontend — strip Supabase, route everything through `src/lib/api.ts`
Files to rewrite (all stay in React, only their data layer changes):
- `src/hooks/useAuth.tsx` — replace `supabase.auth` with `apiClient.login/logout/me`, store nothing in localStorage (cookie-based).
- `src/pages/Rooms.tsx`, `BookingPage.tsx`, `BookingConfirmation.tsx`, `Contact.tsx`, `AdminLogin.tsx`, `AdminBootstrap.tsx`, `AdminDashboard.tsx` — swap every `supabase.from(...)` and `supabase.functions.invoke(...)` for the matching `apiClient.*` call.
- Remove `@supabase/supabase-js` dependency; delete `src/integrations/supabase/` entirely.
- Delete `supabase/` (config + edge functions + migrations).
- Add `VITE_API_URL=https://api.darlys.site` to env.

### 4. Deployment
- Push `darlys-api/` to a new GitHub repo, deploy on Railway with env vars from `.env.example` (`APP_KEY`, `DB_*`, `SESSION_*`, `SANCTUM_STATEFUL_DOMAINS`, `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`, `TELEGRAM_*`, `ADMIN_BOOTSTRAP_SECRET`).
- Map custom domain `api.darlys.site`.
- Repoint Stripe webhook to `https://api.darlys.site/api/stripe/webhook`.
- Republish the React app (which keeps deploying via Lovable).

### 5. QA checklist
- Sign-in/out as admin via session cookie.
- Public room list + room detail.
- Full booking flow → Stripe Checkout → webhook marks paid → Telegram alert fires → Opera log row appears.
- Refund from admin dashboard.
- Contact form submit + admin read/mark.

## What I need from you to start coding

I cannot provision Railway, push to GitHub, or point DNS — those need your accounts. But everything inside the repo I can do. Confirm the two questions below and I'll begin the rewrite.
