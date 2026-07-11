# Hudsten — Context & Handoff

> **Living handoff doc.** A new chat should read this first, then update it (especially
> "Next steps") before you switch chats. Complements `Hudsten-PRD.md` (source of truth),
> `README.md` (setup/deploy), `CLAUDE.md` (dev rules), and `git log` (history).

_Last updated: 2026-06-30 — launch-marketing session: analytics LIVE (GA4 `G-16YZ2YV6BH` + Meta Pixel "Hudsten Pixel" `2440793433063114`); per-product WhatsApp toggle + Amazon-primary CTA (`9748c30`, `b8a9bad`); price → ₹899 / 50% off & 6-mo warranty commented out (`1a2ed52`); ran a Meta 5-ad creative test → pivoted **Amazon-only** (ads → PDP → Amazon). Latest `1a2ed52` on `main`. Earlier: on-demand ISR (`8255552`)._

## June 29–30 2026 — Launch marketing: analytics live, WhatsApp toggle, Amazon-only pivot, Meta ad test

**Analytics — now LIVE (was the big open item):**
- **GA4** property "Hudsten", Measurement ID **`G-16YZ2YV6BH`** (web stream → www.hudsten.in, Enhanced Measurement on). `NEXT_PUBLIC_GA4_ID` set in Vercel storefront + verified in Realtime. Code was already wired (`components/analytics/Analytics.tsx` + `lib/analytics.ts`) and is **consent-gated**: it loads only after the cookie-banner "Accept" (choice persisted in `localStorage` key `hudsten_consent`, one-time per browser — clear it / use incognito to re-trigger the banner). Keep LOCAL `.env.local` blank so dev traffic doesn't pollute prod GA4.
- **Meta Pixel** dataset "Hudsten Pixel", ID **`2440793433063114`** — SEPARATE from `noorish-pixel` (`1435886461152946`, a DIFFERENT brand; never mix). `NEXT_PUBLIC_META_PIXEL_ID` in Vercel. Events fired by our code: PageView / ViewContent (PDP) / Contact (WhatsApp) / **Lead (Amazon-button click + newsletter)**. The stray "SubscribedButtonClick — Automatically logged" is Meta's *automatic* button detection reading the footer newsletter "Subscribe" button — harmless; disable via Pixel Settings → "Track events automatically without code" if wanted. **CAPI** flag was enabled in Events Manager but is NOT implemented (needs server-side integration — TODO).
- **Amazon Attribution: NOT available in India** (only US/CA/UK/DE/FR/IT/ES + Brand Registry). Measure Meta→Amazon via (a) Pixel amazon-click = `Lead`, (b) a **unique Amazon promo code per ad** (Seller Central redemptions = per-ad sales), (c) Seller Central sales correlation during flights.

**Per-product WhatsApp toggle (`9748c30`):** migration `20260630120000_product_whatsapp_toggle.sql` adds `products.whatsapp_enabled boolean not null default true` (additive; existing products default true) + rebuilds `admin_save_product` RPC (unchanged `jsonb` signature). **Applied to remote** via `supabase db push`. Admin: a "Show 'Order on WhatsApp' button" toggle in `ProductEditor` → Buy CTAs. Storefront `ProductBuyBox` now resolves a single `primaryCta`: WhatsApp primary when the toggle is on; **Amazon promoted to the primary button when it's off**; "ordering being set up" fallback if neither. Types + `database.types.ts` hand-updated (regenerate with `pnpm db:types` after the remote migration).

**Amazon-logo CTA (`b8a9bad`):** `AmazonIcon` (trimmed two-tone "a + smile" — white letterform, orange smile) added to the primary "Order on Amazon" button (isolated in `icons.tsx` for easy swap to the official "Available at Amazon" badge).

**Price → ₹899 / warranty removed (`1a2ed52`):** price is now **₹899 (was ₹1,799 = 50% off)**; the **6-month warranty is COMMENTED OUT (not deleted)** in `CompactTrust`, `TrustStrip`, `WhyHudsten`, `about/page.tsx`, and admin `DEFAULT_FAQS`, each with an inline restore note (uncomment + re-add `ShieldIcon` import + trust grids `cols-3`→`cols-4`). Risk-reversal now leans on 7-day returns. ⚠ **Live product FAQ + policy bodies still mention warranty — must be removed in ADMIN (DB data, not code).**

**Meta ads (creative test → Amazon pivot):** 1 campaign `Hudsten_Duffel_CreativeTest_Traffic` → 1 broad ad set `BroadAudience_IGFB` → 5 ads (`ad1_capacity`, `ad2_shoes`, `ad3_hero`, `ad4_lifestyle`, `ad5_comparison`), objective **Traffic → PDP**, ₹500/day CBO, IG+FB feeds. Result: **cheap traffic (~₹1.24/landing-page-view, ~1,800 LPV) but ~0.3% → WhatsApp and 0 sales** → diagnosed as a **conversion/trust/friction** problem (WhatsApp-only, 3-step, no COD, unknown brand, no reviews), NOT a creative problem. **Pivot to Amazon-only:** WhatsApp toggled off for the gym bag so the PDP shows "Order on Amazon"; ads now go **PDP (with UTMs) → Amazon** (keeps GA4/Pixel measurement + retargeting vs. going straight to Amazon). New creatives updated to **₹899 / 50% off / Amazon**; relaunching the top 3 as NEW ads in the same ad set (pause the old 5 — never edit a live ad's creative, it resets learning). Creatives generated with **Gemini / Nano Banana** (full prompts are in the session chat; monochrome, subject-locked to the real bag photo, CTA-free).

**Current verified product facts (from live PDP):** Hudsten Vegan Leather Gym Bag, Black, **₹899 (was ₹1,799, 50% off)**, pebble-grain vegan leather, water-resistant + wipe-clean, 400g, 45.7×22.9×25.4 cm, **dedicated zippered shoe compartment** at base + main compartment + front zip pocket, padded top handles, detachable strap, **no warranty (paused)**, 7-day returns, free shipping. Amazon listing: `amazon.in/.../dp/B0GY8PPZ6D`.

**Note — brand accent green:** the real token is **`#16A34A`** (dark `#15803D`) in `packages/ui/tailwind-preset.cjs` + `src/index.ts` (the `whatsapp` token); the old `#1E7A47` elsewhere in this doc is STALE. Ad CTAs are now black (`#1C1C1C`) to match the site's primary button, not green.

**Open / immediate TODO (launch):**
- [ ] Publish the 3 new Amazon-only ads; **pause the old 5**; raise the **account spending limit** (₹4k balance won't spend past a ~₹508 cap); finish **Meta business verification** (banner).
- [ ] **Unique Amazon promo code per ad** — the only clean per-ad *sales* attribution (India has no Amazon Attribution).
- [ ] Remove warranty from the **live product FAQ + policy bodies** in admin.
- [ ] **CAPI** (server-side Pixel events); **Microsoft Clarity** (heatmaps + session recordings — the real "where do users drop off"); **SPA route-change `page_view`** tracker (Next.js client navs under-report in GA4).
- [ ] Bigger levers for conversion: get **real reviews**, and evaluate **COD / a real checkout** (Phase 2) to fix the root friction that Amazon-only is currently bridging.

## June 18 2026 — Listing filters/sort + MW button motion (committed `c0376ea`)
**Filters/sort (MW pattern), storefront only:** `ListingFilters.tsx` renders a control bar
(count · SORT BY ▾ dropdown · FILTER button w/ active-count) + a right **slide-in filter drawer**
(reuses `Accordion` for Colour/For/Price; Escape + body-scroll-lock; URL sync now incl. `?min=`;
sort adds A–Z / Z–A). Price filter rebuilt as a **dual-handle range** —
`components/filters/PriceRange.tsx`: two overlapping native range inputs + editable currency-aware
min/max fields (band filter `price < min || > max`). Grid / cards / page files untouched.

**MW fill-sweep buttons:** new `Button` variant **`invert`** — a paper `::before` wipes in left→right
on hover (origin right→left swap makes enter+leave sweep the same way), text flips, 1px border stays;
timing matched to MW devtools = **0.45s `cubic-bezier(.785,.135,.15,.86)`**. Applied to Subscribe
(light + dark footer mirror) + Hero CTA. Filter "View results" = MW solid style (space-between
label+count). `lib/cn.ts` now uses `extendTailwindMerge` to register custom `ease-lux` so
timing-function overrides de-dupe (was leaving two `transition-timing-function` classes).
Price field focus uses a single 1px→2px border (no ring): the global `:focus-visible` ring in
`globals.css` was drawing a 2nd box inside the input — suppressed there with `focus-visible:ring-0`.
**Verified:** typecheck 5/5. Not browser-checked (dev `-p 3000` collides with the running server).

### ✅ SHIPPED — granular on-demand ISR + Vercel deploy (2026-06-20, latest `8255552`)
Admin edits update the storefront within seconds, **scoped per entity** — verified live (real admin
save) + locally (prod build: `revalidateTag('product:A')` invalidates ONLY A; `nav` cascades to all).
How it works (the design is the way it is for hard-won Next-15 reasons — don't "simplify" it back):
- **Reads tagged by entity** via `unstable_cache` in `lib/data.ts`: `product:<slug>`,
  `category-products:<id>`, `collection-products:<id>`, `collections-list`, `categories-list`,
  `products-list`, `home`, `settings`, `nav`. Must use `unstable_cache`, NOT tagging the supabase
  fetch — supabase-js bypasses Next's patched fetch, so `next:{tags}` is silently ignored (supabase-js#917).
- **Trigger = the ADMIN, not the DB.** `apps/admin/src/api/revalidate.ts` (`revalidateStorefront(tags)`)
  POSTs the affected entity tags to storefront `/api/revalidate` after each save, auth'd by the admin's
  **Supabase JWT** (verified server-side + CORS; no secret in the SPA bundle). Each mutation computes its
  tags (product save → `product:<slug>` + `category-products:<catId>` + `collection-products:<each>` +
  `home`; collection/category similar; settings→`settings`, nav→`nav` which sit in the layout → all pages).
- **Param pages generate at runtime** (`p|c|collections/[slug]`: `force-static` + `dynamicParams=true`
  + empty `generateStaticParams`) — build-time-prerendered entries aren't reliably invalidatable on demand.
- **`sanitize-html`** (not isomorphic-dompurify) for admin HTML — jsdom fails in Vercel's serverless
  runtime once a PDP renders on demand.
- **DB-side revalidation was REMOVED** — migration `20260620150000` dropped the pg_net triggers + function;
  `120000/130000/140000` are the now-superseded webhook iterations (kept in history, inert).

**Deploy state (both live on Vercel, auto-deploy from `main`):**
- Storefront `hudsten-storefront` → **`www.hudsten.in`** (canonical); `hudsten.in` + `hudsten.com` +
  `www.hudsten.com` → 308 → it (Hostinger DNS: apex `@` A→Vercel, `www` CNAME→`cname.vercel-dns.com`).
  `NEXT_PUBLIC_SITE_URL=https://www.hudsten.in`.
- Admin `hudsten-admin` → **`hudsten-admin.vercel.app`** (root `apps/admin`, Vite, `apps/admin/vercel.json`
  SPA catch-all rewrite, `VITE_SUPABASE_*` env). Its URL is in Supabase **Auth → URL Configuration**.
- GitHub `git@github.com:khushab/hudsten.git` (branch `mw-content-model` == `main`).

**Revalidation cleanup (done 2026-06-20):** Vault secrets `revalidate_url`/`revalidate_secret` deleted;
`REVALIDATE_SECRET` removed from `.env.example`. ⬅ **One manual step left: delete `REVALIDATE_SECRET`
from the Vercel storefront env** (dashboard — it's unused now that auth is JWT). Still open: **analytics**
(GA4 + Meta Pixel IDs unset) — see [[analytics-setup-reminder]] / §B; rotate Supabase service-role key +
change temp admin pw.

## June 17 2026 — MW restyle + content-model refactor (this session)
**Git / branches:** work is on `mw-content-model`, fast-forwarded into **`main` (both @ `7285e86`)**. No git
remote (local only). `design-revamp` @ `ba9aaaa` is the pre-content-model **restore point**. Full revert per
**`REVERT.md`**: `git reset --hard fc8e778` on `main` + `git checkout design-revamp` + `supabase db reset`.
(The prior 2026-06-11 audit-improvement pass is done + its migrations applied — see "earlier done" below.)

**Design → Mission Workshop–inspired monochrome** (replaced the old "monochrome-luxe" brass look). Matched
to the MW reference (https://missionworkshop.com/products/control-pack-folio) from devtools values:
- Font **Instrument Sans**, self-hosted via `next/font/google` (no runtime Google call; identical on every OS).
  **Restart the dev server once** so it fetches. Replaced the self-hosted Inter.
- Tokens (in `packages/ui/tailwind-preset.cjs` + TS mirror `packages/ui/src/index.ts` + storefront
  `globals.css`): ink `#1C1C1C`, paper `#fff` / surface `paper-dim #f5f5f3`, hairline `stone-200 #E4E4E2`,
  **0.18em** uppercase tracking (the `caps` token), **square corners** (all radii 0 except `full`), flat
  (shadows → hairlines). Dark footer `#1C1C1C`; Related-products grey band `#EFEFEF`. ONE accent = refined
  green **`whatsapp #1E7A47`** reserved for the WhatsApp CTA + trust ticks (kept green on purpose).
- Exact PDP type: title 20px, price = ink @ 65% ~18px, editorial heading 25px / body 14px — all `#1C1C1C` @ 0.18em.

**Content model (DB schema CHANGED — applied to remote + types regenerated):** dropped the dynamic
`spec_schema` system. `products` now has `details`, `specifications` (rich HTML), `video_url`, `faqs`
(jsonb `[{question,answer}]`), `editorial_blocks` (jsonb `[{image_url,heading,body}]`). **Dropped
`products.specs`, `products.product_type_id`, and the whole `product_types` table** (Option A — Product Types
feature removed). `admin_save_product` RPC **v2** writes the new columns. Migrations
`20260616120000` (schema), `120001` (RPC v2), `120002` (dev content backfill) are applied; `pnpm db:types` done.

**Admin:** Tiptap `RichText` editor (`apps/admin/src/components/RichText.tsx`) for Description/Details/
Specifications; product video-URL field; **FAQ editor** (seeds 5 default questions on new products);
`EditorialBlocksEditor`. **Product Types page/route/API + the dynamic Specs form were removed.**

**Storefront PDP:** Description/Details/Specifications accordions + a separate **"FAQ"** section
(`components/product/Faq.tsx`); **state-driven `Accordion`** (animates open AND close — replaced native
`<details>`); full-bleed **alternating editorial** section; "Pairs well with" → centered **"Related products"**
on the grey band; **two-row sticky CTA** (price + compare-at + discount, full-width button, no clip); centered
product cards with **colour-swatch dots**; `Reveal` scroll-in + accordion + hover animations (reduced-motion-safe).
Removed `SpecsTable`, `WhatsInBox`; removed `spec-schema.ts`/`schemas/spec.ts`/`SPEC_FIELD_TYPES` from `shared`.

**Verified:** `pnpm typecheck` **5/5 green**; anon-REST read confirms PDP content fields populated. **Not**
browser-screenshotted: storefront `dev` script hardcodes `-p 3000`, which collides with the running dev server,
so the preview tool can't boot a 2nd `next dev`. Review on your own `:3000` (restart it for the font).

### ⚠ In progress / immediate next
- **Consistency pass — DONE** (in `7285e86`): non-PDP headings brought to MW's small scale — page titles
  → `text-3xl` (~30px); `SectionHeading` → `text-2xl` **centered, eyebrow removed**; Hero →
  `text-3xl sm:text-4xl` (30–40px). The PDP was already matched exactly to MW devtools values.
- **NEXT — refine to EXACT** on the **home / listing / about** pages: only MW's *product* page has been
  referenced, so those pages got a consistency pass, not an exact diff. Provide MW screenshots / devtools
  values for those pages to finish the exact match.
- Open decisions: PDP title 20px is MW-exact but very small (bump if desired); `main` & `mw-content-model`
  are both at `7285e86` (fast-forward; could redo as a `--no-ff` merge commit); optional cleanup — dead
  `brass` token/variant, Gallery `ring-brass`→`ring-ink`, scratch `mw-style-showcase.html` + `design-demos/`,
  the `dev_backfill` migration. **NOTE: CONTEXT.md is intentionally left uncommitted — commit it.**

### Earlier done (2026-06-11 audit pass — applied)
Security (DOMPurify on admin HTML, newsletter origin check, root `error.tsx`); PDP swipe/keyboard gallery +
video slide; variant-in-URL; delivery note near CTA; SEO (`og-default.png`, `/collections` index, About
JSON-LD). Its migrations + `isomorphic-dompurify` are installed/applied.

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
  repository layer + generated types), `ui` (Mission Workshop-style monochrome Tailwind preset).
- **Supabase** project ref `gvaknqkaooqmtyvknyik` (region Sydney). Migrations applied +
  seeded + types generated. RLS: anon read-only on active rows; admin CRUD via `is_admin()`.

## Status (what's done)
- **DB:** PRD §4 tables (minus `product_types`, dropped this session), enums, indexes, RLS, storage
  bucket; seeded 13 categories, 4 gym bags w/ variants + color-tagged images + rich Details/Specs/FAQ/
  editorial, 3 collections, nav, settings. Reviews ship empty. Types in
  `packages/db/src/database.types.ts` (regen via `pnpm db:types`).
- **Storefront:** home, `/c/[slug]`, `/collections/[slug]`, `/p/[slug]` (PDP), policies,
  about, contact, search; variant-image gallery; WhatsApp(primary)+Amazon(secondary) CTAs;
  SEO (metadata, JSON-LD Product/Offer/BreadcrumbList + Organization/WebSite, sitemap, robots,
  favicon); GA4 + Meta Pixel (consent-gated); newsletter capture.
- **Admin:** auth + role guard; Products (variant builder, color-tagged image uploader, Tiptap
  rich-text Description/Details/Specifications, FAQ editor, editorial blocks, SEO, per-product CTAs),
  Categories, Collections (manual+smart), Navigation, Settings. (Product Types removed this session.)
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
- Catalog pages are ISR (`revalidate = 3600` backstop, About `86400`). Param pages
  (`p|c|collections/[slug]`) are **runtime-generated** (`force-static` + empty `generateStaticParams`).
  **On-demand revalidation is live** — admin saves refresh affected pages in seconds via entity tags
  (`unstable_cache` + `revalidateTag`, admin-JWT trigger). See the SHIPPED section above for the why.
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
- [x] Deploy storefront + admin — **done** (Vercel: `www.hudsten.in` + `hudsten-admin.vercel.app`;
      env set; domain + SSL + 308 redirects; Supabase Auth URLs added; on-demand ISR live).
- [x] Cleanup: Vault secrets + `.env.example` done; **only `REVALIDATE_SECRET` in Vercel env left to delete** (manual).
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
- [ ] Verify each product: variants generated, images tagged to colors, Details/Specifications/FAQ/
      editorial filled, SEO fields, Amazon URL (if used), price + honest compare-at.
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
