# Hudsten

Fashion & lifestyle ecommerce — launching with gym bags, architected to expand into bags, wallets, leather goods, and apparel without rewrites. **Phase 0 + Phase 1** (catalog storefront + lean admin + WhatsApp/Amazon CTAs). Cart, checkout, payments, accounts, and analytics dashboards are **out of scope** (Phase 2+) — extension points are marked with `// PHASE 2:` comments.

> Single source of truth: [`Hudsten-PRD.md`](./Hudsten-PRD.md).

## Stack

| Layer | Tech |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| Storefront | Next.js (App Router) + TailwindCSS + TypeScript — SSG/ISR, `next/image`, SEO |
| Admin | React + Vite + TypeScript + TailwindCSS (SPA) |
| DB / Auth / Storage | Supabase (Postgres + JSONB, Auth, Storage) — SQL migrations + RLS |
| Validation / Forms / Data | zod · react-hook-form · TanStack Query (admin) |

## Repo structure

```
hudsten/
├─ apps/
│  ├─ storefront/        # Next.js (public site)
│  └─ admin/             # React + Vite (internal SPA)
├─ packages/
│  ├─ db/                # Supabase client + generated types + repository layer
│  ├─ shared/            # types, zod schemas, constants, wa.me builder
│  └─ ui/                # shared Tailwind design tokens (monochrome-luxe preset)
├─ supabase/
│  ├─ migrations/        # SQL schema (enums → tables → indexes → RLS → storage)
│  └─ seed.sql           # seed data (Bag type, gym bags, collections, nav, settings)
├─ Hudsten-PRD.md
└─ README.md
```

## Prerequisites

- Node ≥ 20 (`.nvmrc` pins 20). Enable pnpm via `corepack enable && corepack prepare pnpm@9.15.0 --activate`.
- [Supabase CLI](https://supabase.com/docs/guides/cli) (`supabase --version`).
- A Supabase project (this repo is linked to project `gvaknqkaooqmtyvknyik` — see `supabase/config.toml`).

## Setup

```bash
pnpm install

# Env: copy examples and fill in your Supabase anon key + URL.
cp apps/storefront/.env.example apps/storefront/.env.local
cp apps/admin/.env.example      apps/admin/.env.local
```

### Environment variables

**Storefront** (`apps/storefront/.env.local`) — all public/`NEXT_PUBLIC_`:
| Var | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | e.g. `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key (safe to expose; RLS is the gate) |
| `NEXT_PUBLIC_SITE_URL` | canonical URL for SEO/OG/sitemap/WhatsApp links |
| `NEXT_PUBLIC_GA4_ID` / `NEXT_PUBLIC_META_PIXEL_ID` | analytics (optional; blank = off) |

**Admin** (`apps/admin/.env.local`) — Vite only exposes `VITE_*`:
| Var | Notes |
|---|---|
| `VITE_SUPABASE_URL` | project URL |
| `VITE_SUPABASE_ANON_KEY` | anon key **only** |

> 🔒 **The service-role key never goes in either app.** Both use the anon key; admins authenticate with their own JWT and RLS authorizes them.

## Database

Migrations are **provided, not auto-run**. Apply them to your linked project:

```bash
supabase login                 # if not already authenticated
supabase db push               # applies supabase/migrations in order
psql "$DATABASE_URL" -f supabase/seed.sql   # or: supabase db reset (local) to seed

# Regenerate the authoritative TS types from the live schema:
pnpm db:types                  # → packages/db/src/database.types.ts
```

Migration order: `enums/functions → tables → indexes → RLS policies → storage`. RLS model:
- **Public (anon):** read-only on active/published rows; child rows (variants/images/etc.) visible only when the parent product is `active`.
- **Admin (`profiles.role = 'admin'`):** full CRUD via `is_admin()`.
- Newsletter: anon insert only (emails never publicly readable).

### Create + promote an admin user

The admin login screen has **no public sign-up** (intentional). Create the user in the
Supabase dashboard (**Auth → Users → Add user**, mark email confirmed), then promote it —
a `profiles` row is auto-created as `customer` by a signup trigger:

```sql
update public.profiles set role = 'admin' where id = '<auth-user-uuid>';
```

The route guard is UX only; the real authorization is the `is_admin()` RLS check on every write.

## Running

```bash
pnpm dev                                  # both apps via Turborepo
pnpm --filter @hudsten/storefront dev     # storefront only → http://localhost:3000
pnpm --filter @hudsten/admin dev          # admin only      → http://localhost:5173
```

## Build / verify

```bash
pnpm build        # turbo build (all)
pnpm typecheck    # tsc across workspaces
```

## Deploy

- **Storefront → Vercel:** root `apps/storefront`, framework Next.js. Set the `NEXT_PUBLIC_*` env vars. ISR/SSG handled by Next.
- **Admin → Vercel or Cloudflare Pages:** build `pnpm --filter @hudsten/admin build`, output `apps/admin/dist` (SPA — add a catch-all rewrite to `index.html`). Set `VITE_*` env vars.
- **Supabase:** hosted. Apply migrations via `supabase db push`; configure Auth redirect URLs for both origins; create the `product-images` storage bucket (migration 05 does this).

## Phase 1 scope

Built: catalog data model, storefront (home/listing/collection/PDP/policies), variant-image PDP engine, WhatsApp (primary) + Amazon (secondary) CTAs, SEO + JSON-LD + sitemap, GA4/Pixel, lean admin CRUD, newsletter capture.

Deliberately **not** built (Phase 2+): cart, checkout, payments (Razorpay), orders, customer accounts, discounts, delivery, review-moderation UI, blog, analytics dashboards. Reviews ship empty (never fabricated); no fake countdown timers.
