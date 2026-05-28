
# Rapport de stage — Dar Lys (Markdown, français)

Livrable unique : `/mnt/documents/rapport-stage-dar-lys.md` (téléchargeable), structuré en chapitres académiques, avec diagrammes en **PlantUML** intégrés (blocs ```plantuml```) que tu pourras rendre via plantuml.com ou l'extension VS Code.

## Structure prévue

1. **Page de garde & remerciements** (templates à compléter)
2. **Résumé / Abstract** (FR + EN court)
3. **Table des matières**
4. **Introduction générale** — contexte, problématique, objectifs
5. **Chapitre 1 — Contexte du projet**
   - Présentation de Dar Lys (Riad à Fès)
   - Cadre du stage (projet de fin d'études)
   - Problématique & objectifs SMART
6. **Chapitre 2 — Étude de l'existant & état de l'art**
   - Sites concurrents (Booking, Airbnb, riads indépendants)
   - Limites des solutions actuelles
   - Choix d'une plateforme multi-tenant
7. **Chapitre 3 — Analyse & spécification des besoins**
   - Besoins fonctionnels (client, admin, super-admin, wholesaler)
   - Besoins non-fonctionnels (sécurité, perf, i18n, accessibilité)
   - **Règles de gestion** (RG01…RG25 : verrouillage 15 min, stock chambres, remises de groupe, RLS multi-tenant, devise, TVA, etc.)
   - **Diagramme de cas d'utilisation** (PlantUML) — acteurs : Visiteur, Client, Admin, Super-Admin, Wholesaler, Système Opera PMS, Stripe, IA Gateway
   - Fiches descriptives des cas d'utilisation principaux (Réserver, Payer, Annuler, Gérer chambres, Consulter dashboard, Discuter avec concierge IA…)
8. **Chapitre 4 — Conception**
   - Architecture générale (3-tier + Edge Functions + services externes) — **diagramme de déploiement** PlantUML
   - **Diagramme de classes** PlantUML (Tenant, Room, Booking, Profile, UserRole, ReservationLock, OperaSyncLog, PaymentEvent, ContactMessage, StaySurvey, TransportBooking…)
   - **Diagramme entité-association / MCD** (PlantUML + correspondance PostgreSQL)
   - **Diagrammes de séquence** : réservation avec verrouillage concurrent, paiement Stripe + webhook, sync Opera, chat concierge IA
   - **Diagramme d'activité** : parcours de réservation multi-étapes
   - Modèle multi-tenant (slug → subdomain, RLS par tenant_id)
9. **Chapitre 5 — Choix technologiques (tout ce qui a été utilisé)**
   - Frontend : React 18, TypeScript 5, Vite 5, Tailwind v3, shadcn/ui, Radix, Framer Motion, React Router, TanStack Query, React Hook Form + Zod, Sonner, Lucide, date-fns, Recharts, Embla Carousel
   - Backend serverless : Supabase (PostgreSQL 15, Auth, Storage, Realtime), Deno Edge Functions
   - Paiements : Stripe Checkout + webhook (cible CMI)
   - IA : Lovable AI Gateway (Gemini, GPT-5) pour le concierge multilingue
   - Email : domaine `notify.darlys.site`, file d'attente `process-email-queue`
   - Intégration PMS : Opera OHIP/HTNG (mode stub)
   - i18n : Context API custom (EN/FR/AR) + CurrencyContext (EUR/USD/GBP/MAD)
   - Tests : Vitest + Playwright
   - Outils : Git, VS Code, ESLint, Lovable, npm/bun
10. **Chapitre 6 — Base de données (détail complet)**
    - Schéma PostgreSQL : 15 tables documentées colonne par colonne (rooms, bookings, tenants, tenant_members, user_roles, profiles, reservation_locks, payment_events, opera_sync_log, contact_messages, stay_surveys, transport_bookings, email_send_log, email_send_state, email_unsubscribe_tokens, suppressed_emails)
    - Enums (`app_role`)
    - Fonctions SQL (`has_role`, `is_tenant_admin`, `is_tenant_member`, `is_super_admin`, contrainte d'exclusion sur les réservations)
    - **Toutes les politiques RLS** par table
    - Triggers & migrations clés
11. **Chapitre 7 — Edge Functions (toutes documentées)**
    - `check-availability` — vérif disponibilité + verrouillage 15 min
    - `create-checkout` — session Stripe par tenant
    - `stripe-webhook` — confirmation paiement
    - `process-refund` — remboursement + maj statut
    - `opera-sync` — sync PMS stub
    - `concierge-ai` — chat IA multi-tenant + recommandations croisées
    - `admin-bootstrap` — création du premier admin
    - `process-email-queue` — relais emails transactionnels
12. **Chapitre 8 — Réalisation & écrans**
    - Pages publiques : Home, About, Rooms, Restaurant, Spa, Gallery, Contact, FAQ, Offers, Events, Access, Transport, Booking, Booking Confirmation, Stay Survey, Reviews
    - Espace admin : login, bootstrap, dashboard (stats, bookings, rooms, logs)
    - Super-admin : gestion tenants + génération snippet embed
    - Widget concierge embarquable (`public/embed/concierge.js`)
    - Captures d'écran : emplacements réservés `![](docs/screens/…)` à remplir
13. **Chapitre 9 — Sécurité**
    - RLS multi-tenant + GRANTs
    - Séparation rôles (`user_roles` + `has_role` SECURITY DEFINER)
    - Validation Origin pour widget embed
    - Secrets via Supabase Vault
    - Verrouillage anti-double-réservation
14. **Chapitre 10 — Tests & qualité**
    - Vitest (smoke tests routes)
    - Playwright (parcours réservation)
    - Linting ESLint + TypeScript strict
    - Audit sécurité Supabase Linter
15. **Chapitre 11 — Déploiement**
    - Hébergement Lovable + domaine `darlys.site`
    - Wildcard DNS pour multi-tenant
    - CI/CD automatique
16. **Chapitre 12 — Difficultés rencontrées & solutions**
17. **Chapitre 13 — Bilan & perspectives** (CMI, app mobile, PWA, IA vocale…)
18. **Conclusion générale**
19. **Guide d'utilisation** (annexe A)
    - Pour le visiteur (réserver pas à pas)
    - Pour l'admin (CRUD chambres, suivi réservations, exports)
    - Pour le super-admin (créer un tenant, snippet embed)
    - Pour le développeur (installation locale, variables d'environnement)
20. **Annexes**
    - B. Extraits SQL des migrations principales
    - C. Glossaire (RLS, PMS, OHIP, Edge Function, Tenant, JWT…)
    - D. Bibliographie / webographie
    - E. Tous les diagrammes PlantUML regroupés

## Détails techniques

- Fichier unique Markdown ~45 pages équivalent A4 (≈ 18 000–25 000 mots)
- Tous les diagrammes en blocs ```plantuml``` (cas d'utilisation, classes, séquence, activité, déploiement, ERD)
- Données extraites du code source réel et du schéma Supabase actuel (pas d'invention)
- Téléchargement via `<presentation-artifact>`
- Aucune modification du code applicatif

Si tu valides, je passe en mode build, j'interroge la base pour récupérer le contenu exact (chambres, fonctions SQL), puis je génère le fichier.
