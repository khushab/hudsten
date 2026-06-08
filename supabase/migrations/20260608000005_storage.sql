-- Hudsten — Migration 05: product image storage bucket + policies.
-- Public bucket (served via Supabase CDN with next/image); writes restricted to admins.
-- storage.objects already has RLS enabled by Supabase; we only add policies.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product images public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'product-images');

create policy "product images admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "product images admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "product images admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
