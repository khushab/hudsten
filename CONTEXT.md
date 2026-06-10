# Hudsten — Context & Handoff

> **Living handoff doc.** A new chat should read this first, then update it (especially
> "Next steps") before you switch chats. Complements `Hudsten-PRD.md` (source of truth),
> `README.md` (setup/deploy), `CLAUDE.md` (dev rules), and `git log` (history).

_Last updated: 2026-06-11 — post-audit improvement pass (6 batches, commits 7f6b6d9…9f49c9b)._

## June 2026 improvement pass (done)
- **Security:** DOMPurify on admin HTML (descriptions/policies); newsletter origin
  check; root `error.tsx`; fonts self-hosted (`next/font/local`, no Google Fonts).
- **PDP:** swipe + keyboard gallery; video slide via `specs.video_url` (YouTube/mp4);
  variant selection in URL (`?color=&size=`); delivery note near CTA
  (`settings.delivery_note`); cross-sell fallback; founder link in reviews empty state.
- **Home/listing:** hero→slim trust bar→collection tiles→featured→Why Hudsten→newsletter;
  hero 58vh mobile; card hover image-swap + colour count; filters in URL.
- **SEO:** `public/og-default.png` site-wide fallback; `/collections` index page;
  About JSON-LD; sitemap/footer updated.
- **Admin/DB:** `admin_save_product` RPC = atomic saves (api calls rpc now); storage
  files cleaned on image removal/product delete; pricing-anchor warnings in editor.
- **A11y/perf:** nav `aria-expanded`; AA contrast fixes (stone-400→500/600);
  gallery DOM cap >24 images.

### ⚠ Pending before these fully work (run locally)
1. `pnpm install` (new dep: isomorphic-dompurify).
2. Apply 3 new migrations: `supabase db push`
   (delivery_note + video_url spec · sku unique index · admin_save_product RPC).
   **Admin product saves call the RPC — saving will fail until this is applied.**
3. `pnpm db:types` to regenerate types (delivery_note/RPC were hand-added, regen to confirm).
4. `pnpm build && pnpm typecheck` to verify locally (sandbox verified compile+types;
   SSG data fetch couldn't run there).

---

## TL;DR for a new chat
"Read `CONTEXT.md`, `Hudsten-PRD.md`, and `CLAUDE.md`, then continue the Hudsten build."
Phase 0 + Phase 1 are **built, reviewed, and live on the database**; the site is **not yet
deployed**. The immediate goal is **launch (validate demand)**, not Phase 2.

---

## Project
Fashion/lifestyle ecommerce, launching with gym bags. Monorepo at
`/Users/khushab/Desktop/myfiles/Hudsten`.

- **Monorepo:** pnpm workspaces + Turborepo. **Uses pnpm, NOT yarn** (overrides the global
  "use yarn" rule — the stack mandated pnpm; don't switch it back).
- **Storefront:** Next.js (App Router) + Tailwind — `apps/storefront`. SSG/ISR.
- **Admin:** React + Vite + Tailwind SPA — `apps/admin`.
- **Packages:** `shared` (zod/constants/wa.me builder), `db` (typed Supabase client +
  repository layer + generated types), `ui` (monochrome-luxe Tailwind preset).
- **Supabase** project ref `gvaknqkaooqmtyvknyik` (region Sydney). Migrations applied +
  seeded + types generated. RLS: anon read-only on active rows; admin CRUD via `is_admin()`.

## Status (what's done)
- **DB:** all PRD §4 tables, enums, indexes, RLS, storage bucket; seeded (1 product type,
  13 categories, 4 gym bags w/ variants + color-tagged images, 3 collections, nav, settings).
  Reviews ship empty. Types in `packages/db/src/database.types.ts` (regen via `pnpm db:types`).
- **Storefront:** home, `/c/[slug]`, `/collections/[slug]`, `/p/[slug]` (PDP), policies,
  about, contact, search; variant-image gallery; WhatsApp(primary)+Amazon(secondary) CTAs;
  SEO (metadata, JSON-LD Product/Offer/BreadcrumbList + Organization/WebSite, sitemap, robots,
  favicon); GA4 + Meta Pixel (consent-gated); newsletter capture.
- **Admin:** auth + role guard; Products (variant builder, color-tagged image uploader,
  dynamic specs, SEO, per-product CTAs), Categories, Collections (manual+smart), Product
  Types, Navigation, Settings.
- **Verified:** 5 adversarial review workflows (DB security, storefront acceptance, admin
  security/correctness, final acceptance audit, UX bug hunt) — all findings fixed. Both apps
  build clean. RLS proven (anon can't write; admin JWT can). WhatsApp link verified prefilled.

## NOT built (intentional — Phase 2+)
Cart, checkout, payments (Razorpay), COD, orders, customer accounts, discounts, delivery,
review-moderation UI, blog, analytics dashboards, wishlist, multi-currency. Extension points
marked `// PHASE 2`. No fake reviews / no fake timers.

---

## Run it
```bash
pnpm install
cp apps/storefront/.env.example apps/storefront/.env.local   # already wired locally
cp apps/admin/.env.example      apps/admin/.env.local
pnpm --filter @hudsten/storefront dev   # http://localhost:3000
pnpm --filter @hudsten/admin dev        # http://localhost:5173
pnpm build && pnpm typecheck            # verify
```
**Env vars** — storefront: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID`. Admin:
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. **Anon key only — never the service-role key.**

**Admin access:** login screen has no public signup. Create a user (Supabase dashboard →
Auth → Users), then `update public.profiles set role='admin' where id='<uuid>';`. An admin
already exists: `khushab@thebreadbutter.com` (temp password — change it).

## Key decisions / where things live
- Data access only via repository/api layers (`packages/db`, `apps/admin/src/api`) — the
  portability seam; no Supabase calls in components.
- Variant-image engine: images tagged to Color option-values (`image_option_values`);
  selecting a color filters the PDP gallery; sizes don't; product-level images = fallback.
- WhatsApp builder in `packages/shared/src/whatsapp.ts`; number/template editable in admin.
- Catalog pages are ISR (`revalidate = 3600`) + `generateStaticParams`.
- Analytics only load after cookie consent (`components/analytics`).
- Listing filters (color/gender/price) are client-side over statically-rendered products.

## Secrets / ops to remember
- **Rotate the Supabase service-role key** (it appeared in an earlier session's output).
- **Change the temp admin password.**
- No `.env*` files are committed (gitignored). Service-role key is not in any client bundle.
- DB password is stored locally in gitignored `.env` (`SUPABASE_DB_PASSWORD`) for CLI/psql.

## Open decisions
- Image pipeline: Supabase transforms (now) vs Cloudinary/imgix (scale).
- Search: Postgres ILIKE (now) vs FTS/Algolia (scale).
- Phase 2 commerce: build on Supabase vs adopt **Medusa.js** (decide before checkout).
- Hosting: Vercel (PRD default) vs DigitalOcean App Platform / Cloudflare — undecided.

---

## Next steps (keep this list current)

### Now — Launch Phase 1 (goal: validate demand)
- [ ] Real photography + copy (replace `placehold.co`); fill Settings (WhatsApp #!, policies,
      GST/address, hero, featured collection) and real product data.
- [ ] Set up GA4 + Meta Pixel (see checklist below) and verify events fire.
- [ ] Branded default OG share image (home/listings); submit sitemap to Search Console.
- [ ] Deploy storefront + admin; set env vars; add prod URLs to Supabase Auth.
- [ ] Security/ops: rotate service-role key, change admin password, enable Supabase MFA,
      turn on DB backups/PITR, consider a staging project.
- [ ] (Recommended) Add Microsoft Clarity or PostHog for heatmaps/recordings.

### Later — Phase 2 (monetize) — only after demand signal
- [ ] Decide Supabase-native vs Medusa.js.
- [ ] Cart + checkout, Razorpay + COD, orders + inventory, discounts, reviews live + email,
      customer accounts. Fill the `// PHASE 2` extension points.

---

## Pre-launch checklist

### A. Content & catalog data
- [ ] Replace placeholder images with real product photography (the #1 PDP conversion lever).
- [ ] Admin → Settings: **real WhatsApp number** (with country code), default message template,
      hero (image/headline/subtext/CTA), featured collection, announcement bar.
- [ ] Admin → Settings: contact email, phone, **physical address, GST number** (India trust),
      social links, and **real policy bodies** (privacy/terms/shipping/returns).
- [ ] Verify each product: variants generated, images tagged to colors, specs filled, SEO
      fields, Amazon URL (if used), price + honest compare-at.
- [ ] Navigation menu reflects the real launch nav.

### B. Analytics (GA4 + Meta Pixel — not yet set up)
**GA4**
- [ ] Create a GA4 property at analytics.google.com → Admin → Create property → add a **Web
      data stream** for your domain → copy the **Measurement ID** (`G-XXXXXXXXXX`).
- [ ] Set `NEXT_PUBLIC_GA4_ID` in the storefront env (locally and in the host's env settings).
- [ ] In GA4 → Admin → Events, mark `whatsapp_click` (and/or `generate_lead`) and
      `amazon_click` as **key events / conversions**.
- [ ] Verify in GA4 **Realtime / DebugView** after clicking "Accept" on the cookie banner
      (events are consent-gated — they won't fire until consent is granted).

**Meta Pixel**
- [ ] In Meta **Events Manager**, create a Pixel/Dataset → copy the numeric **Pixel ID**.
- [ ] Set `NEXT_PUBLIC_META_PIXEL_ID` in the storefront env (local + host).
- [ ] Verify with the **Meta Pixel Helper** browser extension — expect `PageView`,
      `ViewContent` (PDP), `Contact` (WhatsApp), `Lead` (Amazon/newsletter).
- [ ] (Later) Add Conversions API for server-side accuracy + ad attribution.

Events already wired: `view_item`, `whatsapp_click`+`generate_lead`, `amazon_click`,
`sign_up` (newsletter). Note: SPA route-change pageviews aren't auto-sent — fine for launch.

### C. SEO
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the real https domain (drives canonical/OG/sitemap/WA links).
- [ ] Add a branded default OG image (home/listings); per-product OG already uses the photo.
- [ ] Verify `sitemap.xml` + `robots.txt`; submit the sitemap in Google Search Console; verify
      domain ownership. Favicon is set (`app/icon.svg`).
- [ ] Spot-check titles/descriptions per product/category.

### D. Deploy
- [ ] Storefront → host of choice (Vercel default; DO/Cloudflare possible). Set all
      `NEXT_PUBLIC_*` env vars in the host.
- [ ] Admin (static SPA) → Vercel / Cloudflare Pages / any static host; set `VITE_*` env;
      add a catch-all rewrite to `index.html`.
- [ ] Supabase → Auth settings: add the **prod site URL + redirect URLs** for both apps.
- [ ] Custom domain + SSL on both.

### E. Security / ops
- [ ] **Rotate the Supabase service-role key** (transcript exposure) — dashboard → Settings → API.
- [ ] **Change the temp admin password.**
- [ ] Enable Supabase **MFA/2FA** on the dashboard account.
- [ ] Turn on **DB backups / Point-in-Time Recovery**.
- [ ] Consider a **staging** Supabase project so you don't test in prod.
- [ ] Confirm secure headers are served (already set in `next.config.mjs`) and HTTPS enforced.

### F. Functional QA (on a real phone)
- [ ] WhatsApp CTA opens a chat to **your** number, prefilled with product + variant + URL.
- [ ] Amazon CTA opens the product's Amazon page in a new tab (and is hidden when no URL).
- [ ] PDP gallery: selecting a color changes images; size doesn't; fallback works.
- [ ] Mobile nav opens/slides; active nav item correct; listing filters + sort work.
- [ ] Newsletter signup succeeds (and the email lands in `newsletter_subscribers`).
- [ ] 404 page, policy pages, about/contact render.
- [ ] Run Lighthouse (perf/SEO/a11y) on home + a PDP.

### G. Legal / business
- [ ] Real privacy/terms/shipping/returns; GST number; business email; domain; (entity reg).

---

## How to view newsletter signups
Stored in Supabase table `public.newsletter_subscribers` (email, source, created_at).
View/export in the Supabase dashboard → Table Editor. (No admin-UI list yet — small add if
wanted. PHASE 2: pipe to an email tool.)
