-- Content-model refactor (see REVERT.md). Replaces the structured spec_schema system
-- with free-form rich-text fields, adds per-product FAQ + editorial blocks + a dedicated
-- video_url, and removes the now-unused Product Types concept (Option A).

-- 1) New product content columns.
alter table public.products
  add column if not exists details          text,
  add column if not exists specifications   text,
  add column if not exists video_url        text,
  add column if not exists faqs             jsonb not null default '[]'::jsonb,
  add column if not exists editorial_blocks jsonb not null default '[]'::jsonb;

-- 2) Preserve the PDP video before dropping specs.
update public.products
set video_url = nullif(specs->>'video_url', '')
where specs ? 'video_url' and nullif(specs->>'video_url', '') is not null;

-- 3) Drop the structured spec system.
alter table public.products drop column if exists specs;

-- 4) Remove Product Types entirely — its only purpose was spec_schema, and its name is
--    rendered nowhere on the storefront. The FK column + RLS policies drop via cascade.
alter table public.products drop column if exists product_type_id;
drop table if exists public.product_types cascade;
