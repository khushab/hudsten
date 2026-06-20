-- Remove the DB-webhook revalidation machinery.
--
-- Revalidation now happens from the ADMIN app: it calls the storefront /api/revalidate after a
-- successful save, authenticated by the admin's own Supabase JWT (no secret in the client bundle,
-- no DB triggers, no pg_net, no Vault). Simpler and easier to reason about.
--
-- The Vault secrets `revalidate_url` / `revalidate_secret` are now unused (left in place; harmless).
-- The storefront's REVALIDATE_SECRET env var can also be removed.

do $$
declare t text;
begin
  foreach t in array array[
    'products', 'product_variants', 'product_images', 'product_collections',
    'collections', 'categories', 'settings', 'navigation_menu'
  ] loop
    execute format('drop trigger if exists revalidate_storefront on public.%I;', t);
  end loop;
end $$;

drop function if exists public.notify_storefront_revalidate();
