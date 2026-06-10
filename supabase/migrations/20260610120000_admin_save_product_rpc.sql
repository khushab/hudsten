-- Atomic product save: the admin editor previously replaced the product graph with
-- a sequence of client statements — a mid-save failure left partial state. This RPC
-- does the same replace-all inside ONE transaction; any error rolls everything back.
--
-- SECURITY INVOKER: runs as the calling (admin) JWT, so existing RLS policies are
-- the authorization layer — no privilege escalation surface.

create or replace function public.admin_save_product(payload jsonb)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  core     jsonb := payload->'core';
  pid      uuid;
  opt      jsonb;
  val      jsonb;
  variant  jsonb;
  img      jsonb;
  opt_id   uuid;
  val_id   uuid;
  var_id   uuid;
  img_id   uuid;
  resolved uuid;
  vkey     text;
  -- Client-side option-value keys → freshly inserted ids.
  key_map  jsonb := '{}'::jsonb;
  badges_arr text[];
begin
  if core is null then
    raise exception 'admin_save_product: payload.core is required';
  end if;

  select coalesce(array_agg(x), '{}')
  into badges_arr
  from jsonb_array_elements_text(coalesce(core->'badges', '[]'::jsonb)) as x;

  -- 1) Upsert core.
  if payload->>'id' is not null then
    pid := (payload->>'id')::uuid;
    update products set
      title = core->>'title',
      slug = core->>'slug',
      description = core->>'description',
      product_type_id = (core->>'product_type_id')::uuid,
      category_id = nullif(core->>'category_id', '')::uuid,
      gender = (core->>'gender')::gender_enum,
      price = (core->>'price')::numeric,
      compare_at_price = (core->>'compare_at_price')::numeric,
      currency = coalesce(nullif(core->>'currency', ''), 'INR'),
      status = (core->>'status')::product_status,
      in_stock = coalesce((core->>'in_stock')::boolean, true),
      specs = coalesce(core->'specs', '{}'::jsonb),
      whatsapp_message_template = core->>'whatsapp_message_template',
      amazon_url = core->>'amazon_url',
      is_featured = coalesce((core->>'is_featured')::boolean, false),
      badges = badges_arr,
      meta_title = core->>'meta_title',
      meta_description = core->>'meta_description'
    where id = pid;
    if not found then
      raise exception 'admin_save_product: product % not found (or not permitted)', pid;
    end if;
  else
    insert into products (
      title, slug, description, product_type_id, category_id, gender, price,
      compare_at_price, currency, status, in_stock, specs,
      whatsapp_message_template, amazon_url, is_featured, badges,
      meta_title, meta_description
    ) values (
      core->>'title',
      core->>'slug',
      core->>'description',
      (core->>'product_type_id')::uuid,
      nullif(core->>'category_id', '')::uuid,
      (core->>'gender')::gender_enum,
      (core->>'price')::numeric,
      (core->>'compare_at_price')::numeric,
      coalesce(nullif(core->>'currency', ''), 'INR'),
      (core->>'status')::product_status,
      coalesce((core->>'in_stock')::boolean, true),
      coalesce(core->'specs', '{}'::jsonb),
      core->>'whatsapp_message_template',
      core->>'amazon_url',
      coalesce((core->>'is_featured')::boolean, false),
      badges_arr,
      core->>'meta_title',
      core->>'meta_description'
    ) returning id into pid;
  end if;

  -- 2) Replace the whole graph (FK cascades remove children/joins).
  delete from product_options     where product_id = pid;
  delete from product_variants    where product_id = pid;
  delete from product_images      where product_id = pid;
  delete from product_collections where product_id = pid;
  delete from product_tags        where product_id = pid;

  -- 3) Options + values; build key → id map (exact, no value/position matching).
  for opt in select * from jsonb_array_elements(coalesce(payload->'options', '[]'::jsonb)) loop
    insert into product_options (product_id, name, position)
    values (pid, opt->>'name', coalesce((opt->>'position')::int, 0))
    returning id into opt_id;

    for val in select * from jsonb_array_elements(coalesce(opt->'values', '[]'::jsonb)) loop
      insert into product_option_values (option_id, value, color_hex, position)
      values (opt_id, val->>'value', val->>'color_hex', coalesce((val->>'position')::int, 0))
      returning id into val_id;
      key_map := key_map || jsonb_build_object(val->>'key', val_id::text);
    end loop;
  end loop;

  -- 4) Variants + composition. A stale key aborts (and rolls back) the save.
  for variant in select * from jsonb_array_elements(coalesce(payload->'variants', '[]'::jsonb)) loop
    insert into product_variants (product_id, title, sku, price, compare_at_price, in_stock, position)
    values (
      pid,
      variant->>'title',
      nullif(variant->>'sku', ''),
      (variant->>'price')::numeric,
      (variant->>'compare_at_price')::numeric,
      coalesce((variant->>'in_stock')::boolean, true),
      coalesce((variant->>'position')::int, 0)
    ) returning id into var_id;

    for vkey in select jsonb_array_elements_text(coalesce(variant->'valueKeys', '[]'::jsonb)) loop
      resolved := (key_map->>vkey)::uuid;
      if resolved is null then
        raise exception
          'Variant "%" references a removed option value. Regenerate variants, then save again.',
          variant->>'title';
      end if;
      insert into variant_option_values (variant_id, option_value_id)
      values (var_id, resolved);
    end loop;
  end loop;

  -- 5) Images + color tag.
  for img in select * from jsonb_array_elements(coalesce(payload->'images', '[]'::jsonb)) loop
    insert into product_images (product_id, url, alt_text, position)
    values (pid, img->>'url', img->>'alt_text', coalesce((img->>'position')::int, 0))
    returning id into img_id;

    if (img->>'colorKey') is not null then
      resolved := (key_map->>(img->>'colorKey'))::uuid;
      if resolved is not null then
        insert into image_option_values (image_id, option_value_id)
        values (img_id, resolved);
      end if;
    end if;
  end loop;

  -- 6) Collections (ordered) + tags.
  insert into product_collections (product_id, collection_id, position)
  select pid, x.value::uuid, (x.ord - 1)::int
  from jsonb_array_elements_text(coalesce(payload->'collectionIds', '[]'::jsonb))
       with ordinality as x(value, ord);

  insert into product_tags (product_id, tag_id)
  select pid, x::uuid
  from jsonb_array_elements_text(coalesce(payload->'tagIds', '[]'::jsonb)) as x;

  return pid;
end;
$$;

-- RLS (invoker) is the real gate; still: no anonymous execution.
revoke execute on function public.admin_save_product(jsonb) from public, anon;
grant execute on function public.admin_save_product(jsonb) to authenticated;
