-- Hudsten — Migration 01: enums + the updated_at touch trigger.
-- Table-dependent functions (is_admin, handle_new_user) live in migration 04,
-- created after their referenced tables so Postgres can validate their bodies.
-- Postgres 17 has gen_random_uuid() in core, so no pgcrypto extension is needed.

-- ── Enums (mirrored in packages/shared/src/constants.ts) ──────────────────────
create type public.gender_enum      as enum ('men', 'women', 'unisex');
create type public.product_status   as enum ('draft', 'active', 'archived');
create type public.collection_type  as enum ('manual', 'smart');
create type public.nav_link_type    as enum ('category', 'collection', 'url', 'dropdown_parent');
create type public.user_role        as enum ('admin', 'customer');

-- ── updated_at touch trigger ─────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
