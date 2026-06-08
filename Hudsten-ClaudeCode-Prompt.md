# Claude Code Prompt — Build Hudsten (Phase 0 + Phase 1)

> Paste this into Claude Code from inside the `hudsten-tech/` folder (with `Hudsten-PRD.md` present).

---

You are the founding engineering team for **Hudsten**, a new fashion & lifestyle ecommerce brand (launching with gym bags, expanding to bags, wallets, leather goods, apparel). You combine senior full-stack, database, SEO, performance, and security expertise.

## Step 0 — Read the PRD first
**`Hudsten-PRD.md` in this folder is the single source of truth.** Read it completely before writing anything. The data model (§4), product page spec (§6), admin spec (§7), and roadmap (§8) are binding. If anything here conflicts with the PRD, the PRD wins — flag the conflict.

## Scope: build ONLY Phase 0 + Phase 1
Do **not** build cart, checkout, payments, orders, customer accounts, discounts, delivery, review-moderation UI, blog, or analytics dashboards. Leave clean, commented extension points where Phase 2 plugs in. Building these now is explicitly out of scope.

## Tech stack (non-negotiable)
- **Monorepo:** pnpm workspaces + Turborepo.
- **Storefront:** Next.js (App Router) + TailwindCSS + TypeScript. SSG/ISR for catalog pages, `next/image`, `generateMetadata`, mobile-first.
- **Admin:** React + Vite + TypeScript + TailwindCSS (SPA).
- **DB/Auth/Storage:** Supabase (Postgres + JSONB, Auth, Storage). SQL migrations + RLS policies. Generate TS types via `supabase gen types`.
- **Validation:** zod. **Forms:** react-hook-form. **Data fetching (admin):** TanStack Query.

## Repo structure
```
hudsten/
├─ apps/
│  ├─ storefront/        # Next.js
│  └─ admin/             # React + Vite
├─ packages/
│  ├─ db/                # Supabase client + generated types
│  ├─ shared/            # shared types, zod schemas, constants (incl. wa.me builder)
│  └─ ui/                # optional shared components/tokens
├─ supabase/
│  ├─ migrations/        # SQL schema
│  ├─ seed.sql           # seed data
│  └─ functions/         # edge functions (only if needed)
├─ Hudsten-PRD.md
└─ README.md
```

## Database — implement exactly per PRD §4
Create SQL migrations for: `product_types`, `categories` (self-ref `parent_id`), `collections` (manual/smart + `rules` jsonb), `products` (core columns + `specs` jsonb + `gender` enum + `badges` + per-product `whatsapp_message_template`/`amazon_url` + SEO + `in_stock`), `product_collections`, `tags`, `product_tags`, `product_options`, `product_option_values` (with `color_hex`), `product_variants`, `variant_option_values`, `product_images`, **`image_option_values`** (image↔option-value link — the variant-image engine), `navigation_menu` (self-ref dropdowns), `settings`, `reviews` (ships empty), `newsletter_subscribers`, `profiles` (role enum).

**RLS (critical):**
- Public (anon): **read-only** on `active`/published rows of products, categories, collections, images, settings, nav, tags.
- Admin (`profiles.role = 'admin'`): full read/write.
- **Never** expose the service-role key to the admin SPA — admin uses the user's JWT; RLS does the rest. Use Edge Functions/Route Handlers (service role server-side) only for ops that genuinely need elevation.

**Seed (`seed.sql`):** one `product_type` "Bag" with a real `spec_schema` (dimensions, weight, capacity_l, materials, compartments, laptop_fit, care, warranty, whats_in_box, country); the full category tree (only Gym Bags populated); 2 smart collections (Men's/Women's Gym Bags filtered by `gender`); 1 manual "New Arrivals"; 3–4 sample gym bags with Color+Size options, variants, **images tagged to colors**, realistic specs, gender, badges, compare-at prices, placeholder `amazon_url`; `settings` with placeholder `whatsapp_number`, default WA message template, hero, contact/GST placeholders, policy stubs; nav menu rows.

## Storefront — Phase 1 build order
1. **Design system first.** Build distinctive Tailwind tokens (color, type scale, spacing, radii), a real typographic hierarchy, and base components. **Avoid generic AI aesthetics** — Hudsten should feel like a premium leather/fashion brand. If a frontend-design skill is available in your environment, use it.
2. **Layout:** sticky header (logo, data-driven nav with dropdowns, search icon, WhatsApp icon), announcement bar, footer with policy links + newsletter signup.
3. **Home:** hero (from settings), featured collection grid, trust strip, newsletter.
4. **Category/listing `/c/[slug]`** and **collection `/collections/[slug]`:** product grid, filters (color, gender, price), breadcrumbs.
5. **Product page `/p/[slug]`** — the conversion engine, per PRD §6:
   - Mobile-first; sticky bottom CTA bar.
   - **Gallery with variant-image behavior:** images joined via `image_option_values`; selecting a **Color** filters the gallery to that color's images; **size selection does not change images**; **preload all color sets** (no flicker); **preserve the active index/angle** across color switch; **fall back** to product-level images if a color has none. Include zoom + optional video.
   - Title, price with `compare_at_price` strikethrough + % off, badges, social-proof slot (real reviews or hidden empty state — **never fake**).
   - Color swatches (use `color_hex`) + size selector.
   - Trust badges near CTA (free shipping, 7-day returns, warranty, secure).
   - **Specs rendered dynamically from the product's `product_type.spec_schema`** reading values from `products.specs`.
   - "What's in the box", FAQ accordion, reviews (empty-state), "Pairs well with" cross-sell.
   - **CTAs (ranked, per PRD):** **Primary = "Order on WhatsApp"** (large, branded) → build `https://wa.me/<settings.whatsapp_number>?text=<encoded>` where the message pre-fills **product name + selected variant + product URL** (put this builder in `packages/shared`). **Secondary = "Prefer Amazon? Buy there"** (smaller) → `product.amazon_url`, new tab. **Both buttons fire GA4 events.**
6. **Policy pages** (privacy/terms/shipping/returns from settings), **About**, **Contact**.
7. **SEO + performance:** `generateMetadata` per page; JSON-LD `Product`, `Offer`, `BreadcrumbList` (and `AggregateRating` only when reviews exist); `sitemap.xml`; `robots.txt`; canonical/OG tags; `next/image` everywhere with AVIF/WebP + lazy-load; ISR on catalog pages.
8. **Analytics:** GA4 + Meta Pixel, `view_item` + WhatsApp/Amazon click events, cookie-consent banner.

## Admin — Phase 1 build order (lean, per PRD §7)
1. **Auth** (Supabase) + admin route guard (role check).
2. **Products:** list (search/filter) + create/edit with — info (title/slug/description/price/compare-at/gender/status/in_stock/badges), **options & variants builder** (Color/Size → generate variant combinations, per-variant sku/price/stock), **image uploader to Supabase Storage with per-image color-tagging UI** (writes `image_option_values`), **specs form dynamically rendered from the selected `product_type.spec_schema`** (saves to `specs` jsonb), SEO fields, per-product WhatsApp template + Amazon URL, primary category + collections.
3. **Categories:** tree view, create/edit, **nesting + drag-reorder**, SEO.
4. **Collections:** manual (pick products) + smart (rule builder writing `rules` jsonb).
5. **Product Types:** define/edit `spec_schema` fields (key/label/type/unit/group) — this controls future expansion.
6. **Navigation:** drag-and-drop menu builder (category/collection/url/dropdown).
7. **Settings:** **WhatsApp number** + default message template, hero, featured collection, contact/GST/social, policy bodies, announcement bar.

## Coding standards & guardrails
- TypeScript strict; shared types/zod schemas in `packages/shared`; **one Supabase client config** reused by both apps via `packages/db`.
- Keep a clean data-access layer (repository functions) so a future move to AWS/GCP/RDS is painless — no Supabase calls scattered through components.
- **Secrets via env vars only; never commit them; never ship the service-role key to the browser.** Provide `.env.example` for both apps.
- Mobile-first; accessible (alt text, contrast, keyboard nav).
- **Reviews ship empty — do NOT seed or fabricate reviews; do NOT add fake countdown timers.** Honest scarcity/social proof only.
- Use clearly-labelled placeholder images/copy where real assets are missing.
- **Provide migrations; do NOT auto-run destructive DB operations. Ask before dropping/altering anything with data.**
- Don't add deferred features (PRD §7 "deferred" list / Phase 2+). If tempted, leave a `// PHASE 2:` comment instead.
- Commit per milestone with clear messages.

## Execution sequence
1. Read `Hudsten-PRD.md`. Then **output a short build plan + the repo scaffold you'll create, and list any clarifying questions.** Wait for nothing trivial — proceed on sensible defaults, but surface real decisions (e.g. image pipeline, search) as `// PHASE 2/DECISION:` notes.
2. Scaffold the monorepo (pnpm + Turborepo, both apps, packages, supabase).
3. Implement DB migrations + RLS + `seed.sql`; generate TS types.
4. Build storefront in the order above (design system → layout → home → listing → **PDP** → policies → SEO/structured data/sitemap → analytics).
5. Build admin in the order above (auth → products → categories → collections → product types → navigation → settings).
6. Write `README.md`: setup, env vars, running both apps, applying migrations/seed, and a deploy guide (Vercel for storefront, Vercel/Cloudflare Pages for admin, Supabase hosted).

## Acceptance criteria (Phase 1 done when)
- [ ] Storefront renders home/category/collection/PDP from Supabase data.
- [ ] **Selecting a Color changes the PDP gallery** (size doesn't); no flicker; falls back gracefully.
- [ ] **WhatsApp CTA (primary)** opens a pre-filled `wa.me` chat with product + variant + URL, using the **admin-configured number**; **Amazon CTA (secondary)** opens the product's Amazon URL. **Both tracked in GA4.**
- [ ] PDP **specs render from the product type's `spec_schema`**.
- [ ] Admin can CRUD products (incl. variants, color-tagged images, dynamic specs, SEO, per-product CTAs), categories (nested), collections (manual + smart), product types, navigation, and settings — all under RLS, **no service-role key in the client**.
- [ ] SEO meta + JSON-LD (`Product`/`Offer`/`BreadcrumbList`) + `sitemap.xml` + `robots.txt` present; strong Lighthouse perf/SEO.
- [ ] No Phase 2 features built; extension points commented.

Begin with Step 0, then output your build plan.
