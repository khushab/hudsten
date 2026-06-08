-- Hudsten — Migration 02: all Phase-0/1 tables (PRD §4).
-- Convention: every table has id uuid PK, created_at; mutable tables also updated_at.
-- ON DELETE rules favor data safety: product children CASCADE with the product,
-- but losing a category/type only nulls the reference (never deletes products).

-- ── profiles (role drives RLS) ───────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '',
  role        public.user_role not null default 'customer',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── product_types (the expansion mechanism) ──────────────────────────────────
create table public.product_types (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  -- array of {key,label,type,unit?,group?,options?} — see packages/shared SpecField
  spec_schema jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── categories (hierarchical, structural) ────────────────────────────────────
create table public.categories (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text not null unique,
  parent_id        uuid references public.categories (id) on delete set null,
  description      text,
  image_url        text,
  meta_title       text,
  meta_description text,
  position         int not null default 0,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint categories_not_self_parent check (parent_id is null or parent_id <> id)
);

-- ── collections (manual / smart merchandising) ───────────────────────────────
create table public.collections (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text not null unique,
  type             public.collection_type not null default 'manual',
  rules            jsonb,            -- smart: {gender, category, tags, price_min, price_max}
  description      text,
  image_url        text,
  meta_title       text,
  meta_description text,
  position         int not null default 0,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── products (core columns + specs JSONB) ────────────────────────────────────
create table public.products (
  id                        uuid primary key default gen_random_uuid(),
  title                     text not null,
  slug                      text not null unique,
  description               text,
  product_type_id           uuid not null references public.product_types (id) on delete restrict,
  category_id               uuid references public.categories (id) on delete set null,
  gender                    public.gender_enum not null default 'unisex',
  price                     numeric(12,2) not null check (price >= 0),
  compare_at_price          numeric(12,2) check (compare_at_price >= 0),
  currency                  text not null default 'INR',
  status                    public.product_status not null default 'draft',
  in_stock                  boolean not null default true,
  specs                     jsonb not null default '{}'::jsonb,
  whatsapp_message_template text,
  amazon_url                text,
  is_featured               boolean not null default false,
  badges                    text[] not null default '{}',
  meta_title                text,
  meta_description          text,
  position                  int not null default 0,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- ── product ↔ collection (M:N) ───────────────────────────────────────────────
create table public.product_collections (
  product_id    uuid not null references public.products (id) on delete cascade,
  collection_id uuid not null references public.collections (id) on delete cascade,
  position      int not null default 0,
  created_at    timestamptz not null default now(),
  primary key (product_id, collection_id)
);

-- ── tags + product ↔ tag (M:N) ───────────────────────────────────────────────
create table public.tags (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  created_at timestamptz not null default now()
);

create table public.product_tags (
  product_id uuid not null references public.products (id) on delete cascade,
  tag_id     uuid not null references public.tags (id) on delete cascade,
  primary key (product_id, tag_id)
);

-- ── options → option values → variants ───────────────────────────────────────
create table public.product_options (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  name       text not null,                 -- "Color", "Size"
  position   int not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id, name)
);

create table public.product_option_values (
  id         uuid primary key default gen_random_uuid(),
  option_id  uuid not null references public.product_options (id) on delete cascade,
  value      text not null,                 -- "Black", "M"
  color_hex  text,                          -- for Color swatches; null for sizes
  position   int not null default 0,
  created_at timestamptz not null default now(),
  unique (option_id, value)
);

create table public.product_variants (
  id               uuid primary key default gen_random_uuid(),
  product_id       uuid not null references public.products (id) on delete cascade,
  title            text not null,            -- "Black / M"
  sku              text,
  price            numeric(12,2) check (price >= 0),           -- null → inherit product.price
  compare_at_price numeric(12,2) check (compare_at_price >= 0),
  in_stock         boolean not null default true,
  position         int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- which option-values compose a variant
create table public.variant_option_values (
  variant_id      uuid not null references public.product_variants (id) on delete cascade,
  option_value_id uuid not null references public.product_option_values (id) on delete cascade,
  primary key (variant_id, option_value_id)
);

-- ── images + the variant-image engine ────────────────────────────────────────
create table public.product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url        text not null,
  alt_text   text,
  position   int not null default 0,
  created_at timestamptz not null default now()
);

-- tags an image to a Color (option value) → PDP gallery filters on color select
create table public.image_option_values (
  image_id        uuid not null references public.product_images (id) on delete cascade,
  option_value_id uuid not null references public.product_option_values (id) on delete cascade,
  primary key (image_id, option_value_id)
);

-- ── navigation (data-driven navbar, self-ref dropdowns) ──────────────────────
create table public.navigation_menu (
  id          uuid primary key default gen_random_uuid(),
  label       text not null,
  link_type   public.nav_link_type not null,
  link_target text,                          -- slug or URL; null for dropdown_parent
  parent_id   uuid references public.navigation_menu (id) on delete cascade,
  position    int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint nav_not_self_parent check (parent_id is null or parent_id <> id)
);

-- ── settings (single-row site config; singleton enforced via id=1 check) ─────
create table public.settings (
  id                                int primary key default 1 check (id = 1),
  store_name                        text not null default 'Hudsten',
  logo_url                          text,
  announcement_bar                  text,
  whatsapp_number                   text,
  whatsapp_default_message_template text,
  hero                              jsonb not null default '{}'::jsonb,
  featured_collection_id            uuid references public.collections (id) on delete set null,
  contact_email                     text,
  phone                             text,
  address                           text,
  gst_number                        text,
  social                            jsonb not null default '{}'::jsonb,
  policies                          jsonb not null default '{}'::jsonb,
  updated_at                        timestamptz not null default now()
);

-- ── reviews (Phase-2-ready, ships EMPTY — never seed/fabricate) ──────────────
create table public.reviews (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products (id) on delete cascade,
  author_name  text not null,
  rating       int not null check (rating between 1 and 5),
  title        text,
  body         text,
  is_published boolean not null default false,  -- PHASE 2: moderation UI flips this
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── newsletter (lead capture from launch) ────────────────────────────────────
create table public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  source     text,
  created_at timestamptz not null default now()
);

-- ── updated_at triggers (only on mutable tables) ─────────────────────────────
create trigger trg_profiles_updated        before update on public.profiles        for each row execute function public.set_updated_at();
create trigger trg_product_types_updated    before update on public.product_types    for each row execute function public.set_updated_at();
create trigger trg_categories_updated       before update on public.categories       for each row execute function public.set_updated_at();
create trigger trg_collections_updated      before update on public.collections      for each row execute function public.set_updated_at();
create trigger trg_products_updated         before update on public.products         for each row execute function public.set_updated_at();
create trigger trg_product_variants_updated before update on public.product_variants for each row execute function public.set_updated_at();
create trigger trg_navigation_menu_updated  before update on public.navigation_menu  for each row execute function public.set_updated_at();
create trigger trg_settings_updated         before update on public.settings         for each row execute function public.set_updated_at();
create trigger trg_reviews_updated          before update on public.reviews          for each row execute function public.set_updated_at();
