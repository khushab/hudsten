-- On-demand ISR revalidation: notify the storefront when catalog/content rows change.
--
-- HOW IT WORKS
--   Each tracked table gets an AFTER INSERT/UPDATE/DELETE *statement-level* trigger that calls
--   public.notify_storefront_revalidate(), which POSTs { type, table } to the storefront's
--   /api/revalidate endpoint via pg_net. The endpoint maps the table to the route patterns it
--   affects and calls Next.js revalidatePath(). Statement-level (not per-row) => at most one or
--   two POSTs per save, even when a save rewrites many child rows (no POST floods).
--
-- SECRETS — kept out of git via Supabase Vault. Set these ONCE, after the storefront is deployed:
--   select vault.create_secret('https://YOURSTORE.com/api/revalidate', 'revalidate_url');
--   select vault.create_secret('<long-random-string>',                  'revalidate_secret');
--   (rotate later with vault.update_secret). The SAME secret string goes in the storefront's
--   REVALIDATE_SECRET env var on the host (Vercel).
--
-- SAFE TO APPLY BEFORE DEPLOY: with no Vault secrets set, the trigger function no-ops.

create extension if not exists pg_net;

create or replace function public.notify_storefront_revalidate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _url    text;
  _secret text;
begin
  select decrypted_secret into _url    from vault.decrypted_secrets where name = 'revalidate_url';
  select decrypted_secret into _secret from vault.decrypted_secrets where name = 'revalidate_secret';

  -- Not configured yet (e.g. before deploy) → do nothing, so this migration is safe to apply now.
  if _url is null or _secret is null then
    return null;
  end if;

  perform net.http_post(
    url     := _url,
    body    := jsonb_build_object('type', tg_op, 'table', tg_table_name),
    headers := jsonb_build_object(
      'Content-Type',        'application/json',
      'x-revalidate-secret', _secret
    ),
    timeout_milliseconds := 5000
  );
  return null;
end;
$$;

-- Attach the same statement-level trigger to every table whose change affects a cached page.
do $$
declare t text;
begin
  foreach t in array array[
    'products', 'product_variants', 'product_images', 'product_collections',
    'collections', 'categories', 'navigation_menu', 'settings'
  ] loop
    execute format('drop trigger if exists revalidate_storefront on public.%I;', t);
    execute format(
      'create trigger revalidate_storefront after insert or update or delete on public.%I '
      || 'for each statement execute function public.notify_storefront_revalidate();', t);
  end loop;
end $$;
