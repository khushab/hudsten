-- Switch revalidation to TAG-based (the reliable path for supabase-js + Next 15 ISR).
--
-- Why: the storefront reads via supabase-js, whose fetches land in Next's Data Cache. Neither the
-- dynamic-pattern nor the concrete-path form of revalidatePath reliably clears those (untagged)
-- entries, so a changed product stayed STALE until the cache TTL. Fix: storefront reads are now
-- tagged `sb:<table>` (lib/supabase/server.ts), and this trigger just sends the changed table so the
-- endpoint can revalidateTag('sb:<table>'). The trigger is simple again — no slug/path resolution;
-- cross-table deps are handled storefront-side (each page is tagged by every table it reads).

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
  if _url is null or _secret is null then return null; end if;  -- not configured → no-op

  perform net.http_post(
    url     := _url,
    body    := jsonb_build_object('table', tg_table_name, 'type', tg_op),
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-revalidate-secret', _secret),
    timeout_milliseconds := 5000
  );
  return null;
end;
$$;

-- Statement-level triggers on the tables the storefront reads (one POST per save, no row floods).
do $$
declare t text;
begin
  -- drop any triggers left by earlier approaches
  foreach t in array array[
    'products', 'product_variants', 'product_images', 'product_collections',
    'collections', 'categories', 'settings', 'navigation_menu'
  ] loop
    execute format('drop trigger if exists revalidate_storefront on public.%I;', t);
  end loop;

  foreach t in array array[
    'products', 'product_collections', 'collections', 'categories', 'settings', 'navigation_menu'
  ] loop
    execute format('create trigger revalidate_storefront after insert or update or delete on public.%I '
                || 'for each statement execute function public.notify_storefront_revalidate();', t);
  end loop;
end $$;
