

# Fix Build Errors + PostgreSQL Backend Enhancements

## Clarification

Your project **already uses PostgreSQL**. Lovable Cloud = managed PostgreSQL + Auth + Edge Functions. All SQL is standard PostgreSQL — no proprietary syntax. The `btree_gist`, `daterange`, exclusion constraints, triggers — all native PostgreSQL features.

## Step 1 — Fix 3 Build Errors

**File: `supabase/functions/create-checkout/index.ts`** (line 3)
- Change `npm:@supabase/supabase-js@2.57.2` → `https://esm.sh/@supabase/supabase-js@2`

**File: `src/pages/Rooms.tsx`** (line 262)
- Fix `dbRooms` state type to include `price_per_night` field

**File: `src/test/setup.ts`** (line 3)
- Add `scrollMargin` property to `IntersectionObserverMock`

## Step 2 — PostgreSQL Migration: Double-Booking Prevention + New Tables

Single migration with pure PostgreSQL SQL:

1. **`btree_gist` extension** — enables exclusion constraints on ranges
2. **Exclusion constraint** on `bookings` — prevents overlapping date ranges per room
3. **`reservation_locks` table** — 15-min temporary holds during checkout
4. **`payment_events` table** — Stripe webhook audit log
5. **`opera_sync_log` table** — Opera PMS integration tracking
6. **New columns** on `bookings`: `stripe_checkout_session_id`, `opera_confirmation_number`
7. **`check_availability()` function** — PostgreSQL function checking date conflicts
8. **`cleanup_expired_locks()` function** — removes stale locks
9. **RLS policies** on all new tables

## Step 3 — Fix `create-checkout` Edge Function

- Fix import
- Keep booking as "pending" until Stripe webhook confirms (not "paid" prematurely)
- Store `stripe_checkout_session_id`
- Check availability before creating session

## Step 4 — New Edge Functions

| Function | Purpose |
|----------|---------|
| `stripe-webhook` | Verify Stripe signature, update booking to confirmed/paid, log to `payment_events` |
| `check-availability` | Query PostgreSQL `check_availability()` function, return boolean |
| `opera-sync` | Stub for Oracle Opera PMS — logs to `opera_sync_log`, ready for API credentials |

## Step 5 — Frontend Updates

- **BookingPage.tsx**: Call availability check before payment
- **BookingConfirmation.tsx**: Poll booking status until webhook confirms
- **AdminDashboard.tsx**: Add payment events + Opera sync tabs
- **Rooms.tsx**: Fix type error

## Files to Create/Edit

| File | Action |
|------|--------|
| PostgreSQL migration | New tables + constraints + functions |
| `supabase/functions/create-checkout/index.ts` | Fix import + logic |
| `supabase/functions/stripe-webhook/index.ts` | New |
| `supabase/functions/check-availability/index.ts` | New |
| `supabase/functions/opera-sync/index.ts` | New |
| `src/pages/Rooms.tsx` | Fix type error |
| `src/pages/BookingPage.tsx` | Add availability check |
| `src/pages/BookingConfirmation.tsx` | Add payment polling |
| `src/pages/AdminDashboard.tsx` | Add new tabs |
| `src/test/setup.ts` | Fix mock |

