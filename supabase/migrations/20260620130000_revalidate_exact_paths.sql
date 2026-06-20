-- Fix: revalidate CONCRETE paths, not dynamic patterns.
--
-- revalidatePath('/p/[slug]', 'page') does NOT reliably purge already-prerendered dynamic pages in
-- Next 15 (verified: PDP stayed STALE with old content after a 200 webhook). So the trigger now
-- resolves the affected slugs itself (SECURITY DEFINER bypasses RLS) and sends ready-to-use exact
-- paths like /p/<slug>; the endpoint just calls revalidatePath() on each.
--
-- Route structure lives here intentionally (the trigger has direct DB access to resolve slugs with
-- no extra round-trip and no RLS limits). If storefront routes change, update the path strings below.

create or replace function public.notify_storefront_revalidate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _url    text;
  _secret text;
  _row    jsonb := to_jsonb(coalesce(NEW, OLD));  -- null for statement-level triggers (unused there)
  _paths  text[] := '{}';
  _slug   text;
begin
  select decrypted_secret into _url    from vault.decrypted_secrets where name = 'revalidate_url';
  select decrypted_secret into _secret from vault.decrypted_secrets where name = 'revalidate_secret';
  if _url is null or _secret is null then return null; end if;  -- not configured → no-op

  if TG_TABLE_NAME = 'products' then
    _paths := array['/p/' || (_row->>'slug'), '/collections', '/', '/sitemap.xml'];
    select c.slug into _slug from categories c where c.id = (_row->>'category_id')::uuid;
    if _slug is not null then _paths := _paths || ('/c/' || _slug); end if;
    -- every collection this product belongs to
    _paths := _paths || array(
      select '/collections/' || col.slug
      from product_collections pc
      join collections col on col.id = pc.collection_id
      where pc.product_id = (_row->>'id')::uuid);

  elsif TG_TABLE_NAME = 'collections' then
    _paths := array['/collections/' || (_row->>'slug'), '/collections', '/', '/sitemap.xml'];

  elsif TG_TABLE_NAME = 'categories' then
    _paths := array['/c/' || (_row->>'slug'), '/sitemap.xml'];

  elsif TG_TABLE_NAME = 'product_collections' then  -- manual membership edits (collection editor)
    select col.slug into _slug from collections col where col.id = (_row->>'collection_id')::uuid;
    if _slug is not null then _paths := array['/collections/' || _slug, '/collections', '/']; end if;
    select p.slug into _slug from products p where p.id = (_row->>'product_id')::uuid;
    if _slug is not null then _paths := _paths || ('/p/' || _slug); end if;

  elsif TG_TABLE_NAME in ('settings', 'navigation_menu') then
    _paths := array['__layout__'];  -- global chrome → revalidate the whole site
  end if;

  if array_length(_paths, 1) is null then return null; end if;

  perform net.http_post(
    url     := _url,
    body    := jsonb_build_object('paths', to_jsonb(_paths)),
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-revalidate-secret', _secret),
    timeout_milliseconds := 5000
  );
  return null;
end;
$$;

-- Data tables → ROW level (need the row to resolve slugs). settings/navigation_menu → STATEMENT level.
-- product_variants / product_images no longer need triggers: every editor save also UPDATEs the
-- products row (admin_save_product), so the products trigger already revalidates the PDP.
do $$
declare t text;
begin
  foreach t in array array['product_variants', 'product_images'] loop
    execute format('drop trigger if exists revalidate_storefront on public.%I;', t);
  end loop;

  foreach t in array array['products', 'product_collections', 'collections', 'categories'] loop
    execute format('drop trigger if exists revalidate_storefront on public.%I;', t);
    execute format('create trigger revalidate_storefront after insert or update or delete on public.%I '
                || 'for each row execute function public.notify_storefront_revalidate();', t);
  end loop;

  foreach t in array array['settings', 'navigation_menu'] loop
    execute format('drop trigger if exists revalidate_storefront on public.%I;', t);
    execute format('create trigger revalidate_storefront after insert or update or delete on public.%I '
                || 'for each statement execute function public.notify_storefront_revalidate();', t);
  end loop;
end $$;
