# Dar Lys — Riad website (student project)

React 18 + Vite + TypeScript + Tailwind + Supabase (rooms/contact/booking flows where configured).

## Quick start

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
npm run preview
```

Tests:

```bash
npm run test
```

## Environment

Copy `.env` values from your Supabase project (URL + anon key) if you use database features. The app runs for static browsing without them; room listing falls back when Supabase is empty.

## What was implemented in this repo

- Public pages: Home, About, Rooms, Restaurant, Spa, Gallery, Contact, FAQ, Booking, **Offers** (`/offers`), **Events** (`/events`), **Access** (`/access`).
- Arabic UI copy removed; French/English-style luxury copy retained.
- Restaurant menu: every line item shows a photo from `src/assets/` (replace files there with **your own licensed** images).
- Riad styling touches: `riad-door-frame` utility, existing zellige/arch patterns.
- Events page can pre-fill Contact form via navigation state.
- Vitest: `IntersectionObserver` mock in `src/test/setup.ts` for Framer Motion; route smoke tests in `src/test/routes.test.tsx`.

## Not in this repo (your original full brief)

- **Laravel 11 + MySQL + Inertia** backend: this project is still SPA + Supabase. Migrating would be a separate codebase or monorepo.
- **Images:** You do **not** need to send image files in chat. Save them on your PC into `src/assets/` (replace a file and keep the same name) or add new files and update the import in the page. See `public/media/README.txt` for a step-by-step. For rights: use your own photos, a licence from the property, or royalty-free stock (Unsplash/Pexels).

## Tools for local editing

- **VS Code** (or Cursor) + Node.js **LTS**.
- **Git** for version control.
- **MySQL** only if you add a Laravel/MySQL backend later; not required for the current frontend-only dev server.
- Optional: **Supabase CLI** if you extend the included migrations/functions.
