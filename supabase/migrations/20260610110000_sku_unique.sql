-- SKU uniqueness across variants (Phase 2 orders/inventory depend on it).
-- Case-insensitive; blank/null SKUs stay allowed (not every variant is coded yet).

-- Fail loudly with context if existing data would violate the index.
do $$
declare dup record;
begin
  select lower(sku) as s, count(*) as n
  into dup
  from public.product_variants
  where sku is not null and sku <> ''
  group by lower(sku)
  having count(*) > 1
  limit 1;

  if found then
    raise exception
      'Duplicate SKU "%" on % variants — resolve in Admin before applying.',
      dup.s, dup.n;
  end if;
end $$;

create unique index if not exists product_variants_sku_unique
  on public.product_variants (lower(sku))
  where sku is not null and sku <> '';
