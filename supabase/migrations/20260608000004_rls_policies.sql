-- Hudsten — Migration 04: table-dependent functions + RLS (the security core, PRD §4/§7).
--
-- Model:
--   • anon + authenticated  → READ-ONLY on published/active rows.
--   • admin (profiles.role)  → full CRUD via is_admin() (the user's JWT; never the service-role key).
--   • child rows (options/variants/images/etc.) are visible publicly ONLY when their parent
--     product is active — otherwise the public anon key could read unreleased (draft) products.
--
-- We rely on Supabase's pre-configured default privileges (anon/authenticated already hold
-- table-level DML grants on public.*); RLS is the actual gate. No blanket GRANTs added here.

-- ── Functions that depend on profiles (created here, after the table exists) ─
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

-- Auto-create a profile (role 'customer') on signup. SECURITY DEFINER to write profiles
-- regardless of RLS. Admins are promoted manually (see README).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), 'customer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Enable RLS everywhere ────────────────────────────────────────────────────
alter table public.profiles               enable row level security;
alter table public.product_types          enable row level security;
alter table public.categories             enable row level security;
alter table public.collections            enable row level security;
alter table public.products               enable row level security;
alter table public.product_collections    enable row level security;
alter table public.tags                   enable row level security;
alter table public.product_tags           enable row level security;
alter table public.product_options        enable row level security;
alter table public.product_option_values  enable row level security;
alter table public.product_variants       enable row level security;
alter table public.variant_option_values  enable row level security;
alter table public.product_images         enable row level security;
alter table public.image_option_values    enable row level security;
alter table public.navigation_menu        enable row level security;
alter table public.settings               enable row level security;
alter table public.reviews                enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- ── profiles ─────────────────────────────────────────────────────────────────
create policy "profiles self/admin read" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());
-- No self-update policy → users cannot escalate their own role. Admin manages profiles.
create policy "profiles admin write" on public.profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── product_types (public read — PDP needs spec_schema to render) ────────────
create policy "product_types public read" on public.product_types
  for select to anon, authenticated using (true);
create policy "product_types admin write" on public.product_types
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── categories ───────────────────────────────────────────────────────────────
create policy "categories public read" on public.categories
  for select to anon, authenticated using (is_active = true);
create policy "categories admin write" on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── collections ──────────────────────────────────────────────────────────────
create policy "collections public read" on public.collections
  for select to anon, authenticated using (is_active = true);
create policy "collections admin write" on public.collections
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── products ─────────────────────────────────────────────────────────────────
create policy "products public read" on public.products
  for select to anon, authenticated using (status = 'active');
create policy "products admin write" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── tags (public read; non-sensitive) ────────────────────────────────────────
create policy "tags public read" on public.tags
  for select to anon, authenticated using (true);
create policy "tags admin write" on public.tags
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── join + child tables: public read gated on the parent product being active ─
create policy "product_collections public read" on public.product_collections
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'active'));
create policy "product_collections admin write" on public.product_collections
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "product_tags public read" on public.product_tags
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'active'));
create policy "product_tags admin write" on public.product_tags
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "product_options public read" on public.product_options
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'active'));
create policy "product_options admin write" on public.product_options
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "product_option_values public read" on public.product_option_values
  for select to anon, authenticated
  using (exists (
    select 1 from public.product_options o
    join public.products p on p.id = o.product_id
    where o.id = option_id and p.status = 'active'
  ));
create policy "product_option_values admin write" on public.product_option_values
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "product_variants public read" on public.product_variants
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'active'));
create policy "product_variants admin write" on public.product_variants
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "variant_option_values public read" on public.variant_option_values
  for select to anon, authenticated
  using (exists (
    select 1 from public.product_variants v
    join public.products p on p.id = v.product_id
    where v.id = variant_id and p.status = 'active'
  ));
create policy "variant_option_values admin write" on public.variant_option_values
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "product_images public read" on public.product_images
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'active'));
create policy "product_images admin write" on public.product_images
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "image_option_values public read" on public.image_option_values
  for select to anon, authenticated
  using (exists (
    select 1 from public.product_images i
    join public.products p on p.id = i.product_id
    where i.id = image_id and p.status = 'active'
  ));
create policy "image_option_values admin write" on public.image_option_values
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── navigation_menu ──────────────────────────────────────────────────────────
create policy "navigation public read" on public.navigation_menu
  for select to anon, authenticated using (is_active = true);
create policy "navigation admin write" on public.navigation_menu
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── settings (public read — store config/policies/contact are meant to show) ─
create policy "settings public read" on public.settings
  for select to anon, authenticated using (true);
create policy "settings admin write" on public.settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── reviews (public read published only; ships empty) ────────────────────────
create policy "reviews public read" on public.reviews
  for select to anon, authenticated using (is_published = true);
create policy "reviews admin write" on public.reviews
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── newsletter_subscribers (public INSERT only; emails never publicly readable) ─
create policy "newsletter public insert" on public.newsletter_subscribers
  for insert to anon, authenticated with check (true);
create policy "newsletter admin read/manage" on public.newsletter_subscribers
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
