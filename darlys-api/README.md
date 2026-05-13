# Dar Lys API (Laravel 11 + PostgreSQL)

Replacement backend for the Dar Lys React app. Replaces Supabase / Lovable Cloud.

## Prereqs

- PHP 8.2+, Composer 2
- A PostgreSQL database (Railway / Neon / self-hosted) — same DB you connect pgAdmin to
- Stripe account (test keys are fine)

## Local setup

```bash
composer create-project laravel/laravel . "11.*"   # only if starting from scratch
composer require laravel/sanctum stripe/stripe-php
php artisan install:api

# copy provided files (controllers, models, routes, config) over the fresh skeleton
# then:
cp .env.example .env
php artisan key:generate

# point at your PG database, then:
php artisan migrate              # only if DB is empty; otherwise skip — schema already in dump
php artisan serve                # http://127.0.0.1:8000
```

## Importing the existing schema + data

1. In pgAdmin, create database `darlys`.
2. Query Tool → open `darlys_full_db_dump.sql` (the file we exported earlier) → F5.
3. Drop the Supabase-only RLS lines + `\restrict` line if the import complains.

## Env vars

See `.env.example`. Critical ones:

```
APP_URL=https://api.darlys.site
DB_CONNECTION=pgsql
SESSION_DOMAIN=.darlys.site
SANCTUM_STATEFUL_DOMAINS=darlys.site,www.darlys.site,localhost:5173
FRONTEND_URL=https://darlys.site
STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
ADMIN_BOOTSTRAP_SECRET=long-random-string
```

## Deploying to Railway

1. Push this folder as its own GitHub repo.
2. Railway → New Project → Deploy from repo → add a PostgreSQL plugin.
3. Set the env vars above. `DATABASE_URL` will be auto-injected; map it in `config/database.php` if needed.
4. Add custom domain `api.darlys.site`.
5. In your Stripe dashboard → Webhooks → endpoint = `https://api.darlys.site/api/stripe/webhook` (events: `checkout.session.completed`, `payment_intent.succeeded`, `charge.refunded`). Copy the new signing secret into `STRIPE_WEBHOOK_SECRET`.

## Endpoints (full list)

See `routes/api.php`. Every endpoint maps 1:1 to a Supabase call removed from the React app.

## After deploy — wiring the frontend

In the React project (Lovable), set:

```
VITE_API_URL=https://api.darlys.site
```

Then ask the Lovable agent to "rewire every supabase call to use src/lib/api.ts now that VITE_API_URL is live".