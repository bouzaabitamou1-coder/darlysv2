
# Plan — React (Lovable) + Laravel + PostgreSQL, no Supabase

Yes, this is fully possible. Lovable only hosts the **React frontend** — it does not care what backend you call. So we keep your site deployed exactly as it is now (`darlys.site` via Lovable), and just change *who the React app talks to*: instead of Supabase, it will call your own Laravel API on a separate host.

```text
 Browser  →  React SPA on Lovable (darlys.site)        ← unchanged hosting
                    │  fetch('https://api.darlys.site/api/...')
                    ▼
              Laravel 11 API  (Railway / Render / VPS)
                    │
                    ▼
              PostgreSQL  (Railway / Neon / your VPS)   ← browse with pgAdmin
```

## What stays the same
- React + Vite + Tailwind + shadcn codebase.
- Lovable hosting, publish button, custom domain `darlys.site`, SSL.
- All pages, i18n, Stripe checkout flow, Telegram alerts, Opera PMS sync logic.

## What changes
| Layer | Today | After |
|---|---|---|
| Database | Supabase Postgres | Your own PostgreSQL on Railway/Neon, viewed in pgAdmin |
| Auth | `supabase.auth` | Laravel Sanctum (cookie session) |
| API | `supabase.from(...)` direct queries | `fetch()` via `src/lib/api.ts` |
| Edge functions | 5 Deno functions | 5 Laravel controllers |
| Hosting (frontend) | Lovable | **Lovable (unchanged)** |
| Hosting (backend) | Supabase managed | Railway (or Render/Fly/VPS) |

---

## Step-by-step plan

### Phase 1 — Backend (already 80% scaffolded in `darlys-api/`)
1. On your machine, run `composer create-project laravel/laravel darlys-api-final` to get a clean Laravel 11 skeleton.
2. Copy our `darlys-api/app/`, `routes/`, `database/`, `.env.example` over the skeleton.
3. Install packages: `composer require laravel/sanctum stripe/stripe-php guzzlehttp/guzzle`.
4. Configure CORS + Sanctum stateful domain = `darlys.site` so cookies work cross-origin.
5. Push to a new GitHub repo.

### Phase 2 — PostgreSQL database
1. Create a Postgres instance (Railway one-click, or Neon free tier).
2. Open pgAdmin → register server with the public connection string → you can now browse tables visually.
3. Run `php artisan migrate --seed` against it to create `rooms`, `bookings`, `users`, `user_roles`, `profiles`, `contact_messages`, `payment_events`, `opera_sync_log`, `reservation_locks`.

### Phase 3 — Deploy Laravel
1. Deploy the GitHub repo on Railway (or Render). Set env vars from `.env.example` (`APP_KEY`, `DB_*`, `STRIPE_*`, `TELEGRAM_*`, `SANCTUM_STATEFUL_DOMAINS=darlys.site`).
2. Map a subdomain `api.darlys.site` to the Laravel app and enable SSL.
3. Update Stripe webhook endpoint to `https://api.darlys.site/api/stripe/webhook`.

### Phase 4 — Switch the React frontend (no downtime)
This is the only part **I do for you, here in Lovable**:
1. Add `VITE_API_URL=https://api.darlys.site` to env.
2. Rewire every page/hook to use `apiClient` from `src/lib/api.ts`:
   - `useAuth.tsx` → `apiClient.login/logout/me`
   - `Rooms.tsx`, `BookingPage.tsx`, `BookingConfirmation.tsx`, `Contact.tsx`, `AdminLogin.tsx`, `AdminBootstrap.tsx`, `AdminDashboard.tsx`
3. Delete `src/integrations/supabase/`, the `supabase/` folder, and `@supabase/supabase-js` from `package.json`.
4. Click **Publish** in Lovable → site is live, now talking to your Laravel API.

### Phase 5 — QA
Sign in as admin · book a room · pay via Stripe · check webhook marks paid · Telegram alert · refund · contact form · pgAdmin shows the rows.

---

## Hosting answer (the thing you asked about)
- **Frontend stays on Lovable forever.** `darlys.site` keeps pointing at Lovable. You keep using the Publish button.
- **Backend lives elsewhere** (Railway/Render/your VPS) under `api.darlys.site`. Lovable does not host PHP/Laravel — that's why this part needs an external provider. Railway free tier is enough to start.
- **Database** = a normal PostgreSQL on the same provider as Laravel, browsable from pgAdmin.

## What I need from you to start
1. Pick the backend host: **Railway** (recommended, easiest) / Render / your own VPS?
2. Confirm subdomain: `api.darlys.site` for the Laravel API — OK?
3. Once Laravel is deployed and you tell me **"VITE_API_URL is live at https://api.darlys.site"**, I'll do Phase 4 (rewire React + delete Supabase) in one shot. Until then, your live site keeps working on Supabase — zero downtime.
