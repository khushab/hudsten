-- Hudsten — Migration 03: indexes for storefront read paths + admin filters.
-- Unique slug columns already have implicit indexes; these cover FK lookups,
-- status/feature filters, ordering, and the variant-image join.

-- products: listing by category/status, featured home grid, ordering
create index idx_products_category      on public.products (category_id);
create index idx_products_status        on public.products (status);
create index idx_products_type          on public.products (product_type_id);
create index idx_products_featured       on public.products (is_featured) where is_featured = true;
create index idx_products_gender        on public.products (gender);

-- categories: nav tree + active filtering
create index idx_categories_parent      on public.categories (parent_id);
create index idx_categories_active      on public.categories (is_active);

-- collections: active filtering
create index idx_collections_active     on public.collections (is_active);

-- M:N join lookups (both directions matter for queries)
create index idx_product_collections_collection on public.product_collections (collection_id);
create index idx_product_tags_tag               on public.product_tags (tag_id);

-- options / variants / images (all filtered by product on the PDP)
create index idx_product_options_product        on public.product_options (product_id);
create index idx_option_values_option           on public.product_option_values (option_id);
create index idx_variants_product               on public.product_variants (product_id);
create index idx_variant_option_values_value    on public.variant_option_values (option_value_id);
create index idx_product_images_product         on public.product_images (product_id);
create index idx_image_option_values_value      on public.image_option_values (option_value_id);

-- navigation: dropdown children + active ordering
create index idx_navigation_parent      on public.navigation_menu (parent_id);
create index idx_navigation_active      on public.navigation_menu (is_active);

-- reviews: published reviews per product (empty for now, ready for Phase 2)
create index idx_reviews_product_published on public.reviews (product_id, is_published);
