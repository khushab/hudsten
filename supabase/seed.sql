-- Hudsten — seed data (PRD §4 seed spec).
-- Deterministic UUIDs so relationships (variants ↔ option values, images ↔ colors) are explicit.
-- Placeholder images use placehold.co and are CLEARLY labelled — swap for real photography.
-- NOTE (PRD guardrail): reviews ship EMPTY — intentionally none seeded.
-- Idempotent-ish: uses ON CONFLICT DO NOTHING so re-running won't duplicate.

-- ════════════════════════════ PRODUCT TYPE ════════════════════════════
-- spec_schema keys match PRD §4: dimensions, weight, capacity_l, materials,
-- compartments, laptop_fit, care, warranty, whats_in_box, country.
insert into public.product_types (id, name, spec_schema) values
('a1a1a1a1-0000-0000-0000-000000000001', 'Bag', '[
  {"key":"dimensions","label":"Dimensions (L×W×H)","type":"text","group":"Dimensions","help":"e.g. 50 × 25 × 28 cm"},
  {"key":"weight","label":"Weight","type":"number","unit":"kg","group":"Dimensions"},
  {"key":"capacity_l","label":"Capacity","type":"number","unit":"L","group":"Dimensions"},
  {"key":"materials","label":"Materials","type":"text","group":"Materials","help":"Outer / lining / hardware"},
  {"key":"compartments","label":"Compartments & Pockets","type":"textarea","group":"Features"},
  {"key":"laptop_fit","label":"Laptop Sleeve","type":"text","group":"Features"},
  {"key":"whats_in_box","label":"What''s in the Box","type":"list","group":"Features"},
  {"key":"care","label":"Care","type":"textarea","group":"Care & Warranty"},
  {"key":"warranty","label":"Warranty","type":"text","group":"Care & Warranty"},
  {"key":"country","label":"Origin","type":"text","group":"Origin"}
]'::jsonb)
on conflict (id) do nothing;

-- ════════════════════════════ CATEGORY TREE ════════════════════════════
-- Only "Gym Bags" is populated at launch (PRD §3).
insert into public.categories (id, name, slug, parent_id, position, is_active, meta_title, meta_description) values
('b0000000-0000-0000-0000-000000000001','Bags','bags',null,1,true,'Premium Bags — Hudsten','Handcrafted bags built to last.'),
('b0000000-0000-0000-0000-000000000002','Gym Bags','gym-bags','b0000000-0000-0000-0000-000000000001',1,true,'Gym Bags — Hudsten','Premium gym bags & duffels engineered for the everyday athlete.'),
('b0000000-0000-0000-0000-000000000003','Backpacks','backpacks','b0000000-0000-0000-0000-000000000001',2,true,null,null),
('b0000000-0000-0000-0000-000000000004','Sling Bags','sling-bags','b0000000-0000-0000-0000-000000000001',3,true,null,null),
('b0000000-0000-0000-0000-000000000005','Handbags','handbags','b0000000-0000-0000-0000-000000000001',4,true,null,null),
('b0000000-0000-0000-0000-000000000006','Travel Bags','travel-bags','b0000000-0000-0000-0000-000000000001',5,true,null,null),
('b0000000-0000-0000-0000-000000000007','Luggage','luggage','b0000000-0000-0000-0000-000000000001',6,true,null,null),
('b0000000-0000-0000-0000-000000000008','Wallets & Leather Accessories','wallets-leather-accessories',null,2,true,null,null),
('b0000000-0000-0000-0000-000000000009','Wallets','wallets','b0000000-0000-0000-0000-000000000008',1,true,null,null),
('b0000000-0000-0000-0000-00000000000a','Leather Accessories','leather-accessories','b0000000-0000-0000-0000-000000000008',2,true,null,null),
('b0000000-0000-0000-0000-00000000000b','Apparel','apparel',null,3,true,null,null),
('b0000000-0000-0000-0000-00000000000c','Leather Jackets','leather-jackets','b0000000-0000-0000-0000-00000000000b',1,true,null,null),
('b0000000-0000-0000-0000-00000000000d','T-Shirts','t-shirts','b0000000-0000-0000-0000-00000000000b',2,true,null,null)
on conflict (id) do nothing;

-- ════════════════════════════ COLLECTIONS ════════════════════════════
-- 2 smart (gender-filtered; members derived at query time) + 1 manual.
-- Smart rule convention: a gender rule includes 'unisex' too (see packages/db smart resolver).
insert into public.collections (id, name, slug, type, rules, position, is_active, meta_title, meta_description) values
('c0000000-0000-0000-0000-000000000001','Men''s Gym Bags','mens-gym-bags','smart','{"gender":"men","category":"gym-bags"}'::jsonb,1,true,'Men''s Gym Bags — Hudsten','Gym bags & duffels for men.'),
('c0000000-0000-0000-0000-000000000002','Women''s Gym Bags','womens-gym-bags','smart','{"gender":"women","category":"gym-bags"}'::jsonb,2,true,'Women''s Gym Bags — Hudsten','Gym bags & totes for women.'),
('c0000000-0000-0000-0000-000000000003','New Arrivals','new-arrivals','manual',null,3,true,'New Arrivals — Hudsten','The latest drops from Hudsten.')
on conflict (id) do nothing;

-- ════════════════════════════ SETTINGS (single row) ════════════════════════════
insert into public.settings (
  id, store_name, logo_url, announcement_bar, whatsapp_number, whatsapp_default_message_template,
  hero, featured_collection_id, contact_email, phone, address, gst_number, social, policies
) values (
  1, 'Hudsten', null,
  'Free shipping on all orders · 7-day easy returns',
  '+91 90000 00000', -- PLACEHOLDER number — replace in Admin → Settings
  -- E'' escape string so \n becomes a REAL newline (wa.me needs %0A, not literal "\n").
  E'Hi Hudsten 👋 I\'d like to order:\n\n*{product}*{variant}\n{price}\n\n{url}\n\nIs this in stock?',
  '{
     "image_url":"https://placehold.co/1920x1080/111111/FAFAF7?text=HUDSTEN+%E2%80%94+Carry+Better",
     "headline":"Carry Better.",
     "subtext":"Premium gym bags, handcrafted to outlast the hype.",
     "cta_label":"Shop Gym Bags",
     "cta_link":"/c/gym-bags"
   }'::jsonb,
  'c0000000-0000-0000-0000-000000000003',
  'hello@hudsten.example', '+91 90000 00000',
  '[PLACEHOLDER] 123 Example Street, Bengaluru, KA 560001, India',
  '[PLACEHOLDER GSTIN] 29ABCDE1234F1Z5',
  '{"instagram":"https://instagram.com/hudsten","facebook":"https://facebook.com/hudsten","youtube":"","x":""}'::jsonb,
  '{
     "privacy":"<p>[PLACEHOLDER] Hudsten respects your privacy. Replace this with your full privacy policy.</p>",
     "terms":"<p>[PLACEHOLDER] Terms &amp; conditions go here.</p>",
     "shipping":"<p>[PLACEHOLDER] We ship across India in 3–7 business days. Free shipping on all orders.</p>",
     "returns":"<p>[PLACEHOLDER] 7-day easy returns on unused items in original condition.</p>"
   }'::jsonb
)
on conflict (id) do nothing;

-- ════════════════════════════ TAGS ════════════════════════════
insert into public.tags (id, name, slug) values
('fa000000-0000-0000-0000-000000000001','Leather','leather'),
('fa000000-0000-0000-0000-000000000002','Water-resistant','water-resistant'),
('fa000000-0000-0000-0000-000000000003','Gym','gym'),
('fa000000-0000-0000-0000-000000000004','Weekender','weekender')
on conflict (id) do nothing;

-- ════════════════════════════ PRODUCTS ════════════════════════════
-- amazon_url set on Atlas + Vanguard; null on Aura + Forge (tests "hide secondary CTA").
-- compare_at_price null on Forge (tests "no discount badge" path).
insert into public.products (
  id, title, slug, description, product_type_id, category_id, gender,
  price, compare_at_price, currency, status, in_stock, specs,
  whatsapp_message_template, amazon_url, is_featured, badges, meta_title, meta_description, position
) values
(
  'd0000000-0000-0000-0000-000000000001','Atlas Gym Duffel','atlas-gym-duffel',
  '<p>The Atlas is our everyday workhorse — a 35L duffel that swallows a full gym kit and still slides under your desk. Structured base, water-resistant shell, and a dedicated shoe tunnel.</p>',
  'a1a1a1a1-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000002','unisex',
  2499, 3499, 'INR', 'active', true,
  '{"dimensions":"50 × 25 × 28 cm","weight":0.9,"capacity_l":35,"materials":"Water-resistant 1200D poly shell · ripstop lining · YKK hardware","compartments":"Main zip compartment, ventilated shoe tunnel, interior zip pocket, 2 side pockets","laptop_fit":"Padded sleeve fits up to 15\"","whats_in_box":["Atlas Gym Duffel","Detachable padded shoulder strap","Dust bag"],"care":"Wipe clean with a damp cloth. Do not machine wash.","warranty":"1-year manufacturer warranty","country":"Handcrafted in India"}'::jsonb,
  null, 'https://www.amazon.in/dp/PLACEHOLDERATLAS', true, '{New,Bestseller}',
  'Atlas Gym Duffel — 35L Water-resistant Gym Bag | Hudsten','A 35L gym duffel with a ventilated shoe tunnel and 15" laptop sleeve. Water-resistant, handcrafted in India.',1
),
(
  'd0000000-0000-0000-0000-000000000002','Vanguard Weekender','vanguard-weekender',
  '<p>Two days, one bag. The Vanguard pairs full-grain leather trim with a 40L cabin-friendly body — equal parts gym holdall and weekend carry.</p>',
  'a1a1a1a1-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000002','men',
  3299, 4299, 'INR', 'active', true,
  '{"dimensions":"55 × 27 × 30 cm","weight":1.2,"capacity_l":40,"materials":"Full-grain leather trim · waxed canvas body · brass hardware","compartments":"Main compartment, zip end pocket, interior slip pocket","laptop_fit":"No dedicated sleeve","whats_in_box":["Vanguard Weekender","Leather luggage tag","Dust bag"],"care":"Condition leather trim every 3 months. Spot clean canvas.","warranty":"1-year manufacturer warranty","country":"Handcrafted in India"}'::jsonb,
  null, 'https://www.amazon.in/dp/PLACEHOLDERVANG', true, '{Bestseller}',
  'Vanguard Weekender — 40L Leather-trim Duffel | Hudsten','A 40L cabin-friendly weekender with full-grain leather trim and waxed-canvas body. Handcrafted in India.',2
),
(
  'd0000000-0000-0000-0000-000000000003','Aura Studio Tote','aura-studio-tote',
  '<p>From mat to meeting. The Aura is an 18L structured tote with a wipe-clean interior and a sleeve that keeps your laptop and your towel politely apart.</p>',
  'a1a1a1a1-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000002','women',
  1999, 2799, 'INR', 'active', true,
  '{"dimensions":"38 × 16 × 30 cm","weight":0.7,"capacity_l":18,"materials":"Vegan saffiano leather · water-resistant lining · gold-tone hardware","compartments":"Main compartment, padded sleeve, zip valuables pocket, 2 slip pockets","laptop_fit":"Padded sleeve fits up to 13\"","whats_in_box":["Aura Studio Tote","Detachable crossbody strap","Dust bag"],"care":"Wipe with a soft damp cloth. Avoid prolonged sunlight.","warranty":"1-year manufacturer warranty","country":"Handcrafted in India"}'::jsonb,
  null, null, false, '{New}',
  'Aura Studio Tote — 18L Gym & Work Tote | Hudsten','An 18L structured tote with a 13" laptop sleeve and wipe-clean interior. Handcrafted in India.',3
),
(
  'd0000000-0000-0000-0000-000000000004','Forge Sport Holdall','forge-sport-holdall',
  '<p>Built for the grind. The Forge is a 45L holdall with a reinforced base, compression straps, and a separate vented compartment for kit you''d rather not smell tomorrow.</p>',
  'a1a1a1a1-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000002','unisex',
  2799, null, 'INR', 'active', true,
  '{"dimensions":"58 × 28 × 30 cm","weight":1.1,"capacity_l":45,"materials":"Water-resistant 1680D ballistic shell · ripstop lining · gunmetal hardware","compartments":"Main compartment, vented kit compartment, 2 external compression pockets","laptop_fit":"No dedicated sleeve","whats_in_box":["Forge Sport Holdall","Detachable padded strap"],"care":"Wipe clean with a damp cloth.","warranty":"1-year manufacturer warranty","country":"Handcrafted in India"}'::jsonb,
  null, null, true, '{Limited}',
  'Forge Sport Holdall — 45L Gym Holdall | Hudsten','A 45L gym holdall with a vented kit compartment and compression straps. Water-resistant, handcrafted in India.',4
)
on conflict (id) do nothing;

-- manual "New Arrivals" membership (smart collections derive members via rules, not here)
insert into public.product_collections (product_id, collection_id, position) values
('d0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000003',1),
('d0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000003',2),
('d0000000-0000-0000-0000-000000000004','c0000000-0000-0000-0000-000000000003',3)
on conflict do nothing;

-- product ↔ tags
insert into public.product_tags (product_id, tag_id) values
('d0000000-0000-0000-0000-000000000001','fa000000-0000-0000-0000-000000000003'),
('d0000000-0000-0000-0000-000000000001','fa000000-0000-0000-0000-000000000002'),
('d0000000-0000-0000-0000-000000000002','fa000000-0000-0000-0000-000000000004'),
('d0000000-0000-0000-0000-000000000002','fa000000-0000-0000-0000-000000000001'),
('d0000000-0000-0000-0000-000000000003','fa000000-0000-0000-0000-000000000003'),
('d0000000-0000-0000-0000-000000000004','fa000000-0000-0000-0000-000000000003'),
('d0000000-0000-0000-0000-000000000004','fa000000-0000-0000-0000-000000000002')
on conflict do nothing;

-- ════════════════════════════ OPTIONS + VALUES ════════════════════════════
-- e... = options, f... = option values (4th group encodes product index).
insert into public.product_options (id, product_id, name, position) values
('e0000000-0000-0000-0001-000000000001','d0000000-0000-0000-0000-000000000001','Color',1),
('e0000000-0000-0000-0001-000000000002','d0000000-0000-0000-0000-000000000001','Size',2),
('e0000000-0000-0000-0002-000000000001','d0000000-0000-0000-0000-000000000002','Color',1),
('e0000000-0000-0000-0002-000000000002','d0000000-0000-0000-0000-000000000002','Size',2),
('e0000000-0000-0000-0003-000000000001','d0000000-0000-0000-0000-000000000003','Color',1),
('e0000000-0000-0000-0003-000000000002','d0000000-0000-0000-0000-000000000003','Size',2),
('e0000000-0000-0000-0004-000000000001','d0000000-0000-0000-0000-000000000004','Color',1),
('e0000000-0000-0000-0004-000000000002','d0000000-0000-0000-0000-000000000004','Size',2)
on conflict (id) do nothing;

insert into public.product_option_values (id, option_id, value, color_hex, position) values
-- Atlas colors + sizes
('f0000000-0000-0000-0001-000000000001','e0000000-0000-0000-0001-000000000001','Black','#111111',1),
('f0000000-0000-0000-0001-000000000002','e0000000-0000-0000-0001-000000000001','Tan','#A8643C',2),
('f0000000-0000-0000-0001-000000000003','e0000000-0000-0000-0001-000000000002','M',null,1),
('f0000000-0000-0000-0001-000000000004','e0000000-0000-0000-0001-000000000002','L',null,2),
-- Vanguard colors + size
('f0000000-0000-0000-0002-000000000001','e0000000-0000-0000-0002-000000000001','Black','#111111',1),
('f0000000-0000-0000-0002-000000000002','e0000000-0000-0000-0002-000000000001','Brown','#5A3A22',2),
('f0000000-0000-0000-0002-000000000003','e0000000-0000-0000-0002-000000000002','One Size',null,1),
-- Aura colors + size
('f0000000-0000-0000-0003-000000000001','e0000000-0000-0000-0003-000000000001','Blush','#D8A7A1',1),
('f0000000-0000-0000-0003-000000000002','e0000000-0000-0000-0003-000000000001','Black','#111111',2),
('f0000000-0000-0000-0003-000000000003','e0000000-0000-0000-0003-000000000002','One Size',null,1),
-- Forge colors + sizes (Brass color intentionally has NO images → tests gallery fallback)
('f0000000-0000-0000-0004-000000000001','e0000000-0000-0000-0004-000000000001','Charcoal','#3A3F44',1),
('f0000000-0000-0000-0004-000000000002','e0000000-0000-0000-0004-000000000001','Brass','#C9A227',2),
('f0000000-0000-0000-0004-000000000003','e0000000-0000-0000-0004-000000000002','M',null,1),
('f0000000-0000-0000-0004-000000000004','e0000000-0000-0000-0004-000000000002','L',null,2)
on conflict (id) do nothing;

-- ════════════════════════════ VARIANTS + COMPOSITION ════════════════════════════
-- 1d... = variants (4th group encodes product index).
insert into public.product_variants (id, product_id, title, sku, in_stock, position) values
('1d000000-0000-0000-0001-000000000001','d0000000-0000-0000-0000-000000000001','Black / M','ATL-BLK-M',true,1),
('1d000000-0000-0000-0001-000000000002','d0000000-0000-0000-0000-000000000001','Black / L','ATL-BLK-L',true,2),
('1d000000-0000-0000-0001-000000000003','d0000000-0000-0000-0000-000000000001','Tan / M','ATL-TAN-M',true,3),
('1d000000-0000-0000-0001-000000000004','d0000000-0000-0000-0000-000000000001','Tan / L','ATL-TAN-L',false,4),
('1d000000-0000-0000-0002-000000000001','d0000000-0000-0000-0000-000000000002','Black / One Size','VNG-BLK-OS',true,1),
('1d000000-0000-0000-0002-000000000002','d0000000-0000-0000-0000-000000000002','Brown / One Size','VNG-BRN-OS',true,2),
('1d000000-0000-0000-0003-000000000001','d0000000-0000-0000-0000-000000000003','Blush / One Size','AUR-BLU-OS',true,1),
('1d000000-0000-0000-0003-000000000002','d0000000-0000-0000-0000-000000000003','Black / One Size','AUR-BLK-OS',true,2),
('1d000000-0000-0000-0004-000000000001','d0000000-0000-0000-0000-000000000004','Charcoal / M','FRG-CHR-M',true,1),
('1d000000-0000-0000-0004-000000000002','d0000000-0000-0000-0000-000000000004','Charcoal / L','FRG-CHR-L',true,2),
('1d000000-0000-0000-0004-000000000003','d0000000-0000-0000-0000-000000000004','Brass / M','FRG-BRS-M',true,3),
('1d000000-0000-0000-0004-000000000004','d0000000-0000-0000-0000-000000000004','Brass / L','FRG-BRS-L',true,4)
on conflict (id) do nothing;

-- each variant = its color value + size value
insert into public.variant_option_values (variant_id, option_value_id) values
-- Atlas
('1d000000-0000-0000-0001-000000000001','f0000000-0000-0000-0001-000000000001'),('1d000000-0000-0000-0001-000000000001','f0000000-0000-0000-0001-000000000003'),
('1d000000-0000-0000-0001-000000000002','f0000000-0000-0000-0001-000000000001'),('1d000000-0000-0000-0001-000000000002','f0000000-0000-0000-0001-000000000004'),
('1d000000-0000-0000-0001-000000000003','f0000000-0000-0000-0001-000000000002'),('1d000000-0000-0000-0001-000000000003','f0000000-0000-0000-0001-000000000003'),
('1d000000-0000-0000-0001-000000000004','f0000000-0000-0000-0001-000000000002'),('1d000000-0000-0000-0001-000000000004','f0000000-0000-0000-0001-000000000004'),
-- Vanguard
('1d000000-0000-0000-0002-000000000001','f0000000-0000-0000-0002-000000000001'),('1d000000-0000-0000-0002-000000000001','f0000000-0000-0000-0002-000000000003'),
('1d000000-0000-0000-0002-000000000002','f0000000-0000-0000-0002-000000000002'),('1d000000-0000-0000-0002-000000000002','f0000000-0000-0000-0002-000000000003'),
-- Aura
('1d000000-0000-0000-0003-000000000001','f0000000-0000-0000-0003-000000000001'),('1d000000-0000-0000-0003-000000000001','f0000000-0000-0000-0003-000000000003'),
('1d000000-0000-0000-0003-000000000002','f0000000-0000-0000-0003-000000000002'),('1d000000-0000-0000-0003-000000000002','f0000000-0000-0000-0003-000000000003'),
-- Forge
('1d000000-0000-0000-0004-000000000001','f0000000-0000-0000-0004-000000000001'),('1d000000-0000-0000-0004-000000000001','f0000000-0000-0000-0004-000000000003'),
('1d000000-0000-0000-0004-000000000002','f0000000-0000-0000-0004-000000000001'),('1d000000-0000-0000-0004-000000000002','f0000000-0000-0000-0004-000000000004'),
('1d000000-0000-0000-0004-000000000003','f0000000-0000-0000-0004-000000000002'),('1d000000-0000-0000-0004-000000000003','f0000000-0000-0000-0004-000000000003'),
('1d000000-0000-0000-0004-000000000004','f0000000-0000-0000-0004-000000000002'),('1d000000-0000-0000-0004-000000000004','f0000000-0000-0000-0004-000000000004')
on conflict do nothing;

-- ════════════════════════════ IMAGES + COLOR TAGGING ════════════════════════════
-- 1e... = images (4th group encodes product index). placehold.co URLs are placeholders.
insert into public.product_images (id, product_id, url, alt_text, position) values
-- Atlas: Black (2) + Tan (2)
('1e000000-0000-0000-0001-000000000001','d0000000-0000-0000-0000-000000000001','https://placehold.co/1200x1500/111111/FAFAF7?text=Atlas+Black+Front','Atlas Gym Duffel in Black, front view',1),
('1e000000-0000-0000-0001-000000000002','d0000000-0000-0000-0000-000000000001','https://placehold.co/1200x1500/1a1a1a/FAFAF7?text=Atlas+Black+Interior','Atlas Gym Duffel in Black, interior',2),
('1e000000-0000-0000-0001-000000000003','d0000000-0000-0000-0000-000000000001','https://placehold.co/1200x1500/A8643C/FAFAF7?text=Atlas+Tan+Front','Atlas Gym Duffel in Tan, front view',3),
('1e000000-0000-0000-0001-000000000004','d0000000-0000-0000-0000-000000000001','https://placehold.co/1200x1500/b87333/FAFAF7?text=Atlas+Tan+Detail','Atlas Gym Duffel in Tan, hardware detail',4),
-- Vanguard: Black (2) + Brown (2)
('1e000000-0000-0000-0002-000000000001','d0000000-0000-0000-0000-000000000002','https://placehold.co/1200x1500/111111/FAFAF7?text=Vanguard+Black+Front','Vanguard Weekender in Black, front view',1),
('1e000000-0000-0000-0002-000000000002','d0000000-0000-0000-0000-000000000002','https://placehold.co/1200x1500/1a1a1a/FAFAF7?text=Vanguard+Black+Side','Vanguard Weekender in Black, side view',2),
('1e000000-0000-0000-0002-000000000003','d0000000-0000-0000-0000-000000000002','https://placehold.co/1200x1500/5A3A22/FAFAF7?text=Vanguard+Brown+Front','Vanguard Weekender in Brown, front view',3),
('1e000000-0000-0000-0002-000000000004','d0000000-0000-0000-0000-000000000002','https://placehold.co/1200x1500/6b4423/FAFAF7?text=Vanguard+Brown+Detail','Vanguard Weekender in Brown, leather detail',4),
-- Aura: Blush (2) + Black (2)
('1e000000-0000-0000-0003-000000000001','d0000000-0000-0000-0000-000000000003','https://placehold.co/1200x1500/D8A7A1/111111?text=Aura+Blush+Front','Aura Studio Tote in Blush, front view',1),
('1e000000-0000-0000-0003-000000000002','d0000000-0000-0000-0000-000000000003','https://placehold.co/1200x1500/e0b8b3/111111?text=Aura+Blush+Interior','Aura Studio Tote in Blush, interior',2),
('1e000000-0000-0000-0003-000000000003','d0000000-0000-0000-0000-000000000003','https://placehold.co/1200x1500/111111/FAFAF7?text=Aura+Black+Front','Aura Studio Tote in Black, front view',3),
('1e000000-0000-0000-0003-000000000004','d0000000-0000-0000-0000-000000000003','https://placehold.co/1200x1500/1a1a1a/FAFAF7?text=Aura+Black+Detail','Aura Studio Tote in Black, strap detail',4),
-- Forge: Charcoal (2) tagged + 2 product-level UNTAGGED (fallback for Brass which has no images)
('1e000000-0000-0000-0004-000000000001','d0000000-0000-0000-0000-000000000004','https://placehold.co/1200x1500/3A3F44/FAFAF7?text=Forge+Charcoal+Front','Forge Sport Holdall in Charcoal, front view',1),
('1e000000-0000-0000-0004-000000000002','d0000000-0000-0000-0000-000000000004','https://placehold.co/1200x1500/4a4f54/FAFAF7?text=Forge+Charcoal+Vent','Forge Sport Holdall in Charcoal, vented compartment',2),
('1e000000-0000-0000-0004-000000000003','d0000000-0000-0000-0000-000000000004','https://placehold.co/1200x1500/2b2b2b/FAFAF7?text=Forge+Lifestyle','Forge Sport Holdall, lifestyle shot',3),
('1e000000-0000-0000-0004-000000000004','d0000000-0000-0000-0000-000000000004','https://placehold.co/1200x1500/222222/FAFAF7?text=Forge+Scale','Forge Sport Holdall, scale reference',4)
on conflict (id) do nothing;

-- tag images to their Color value (Forge images 3 & 4 left untagged on purpose → fallback set)
insert into public.image_option_values (image_id, option_value_id) values
('1e000000-0000-0000-0001-000000000001','f0000000-0000-0000-0001-000000000001'),
('1e000000-0000-0000-0001-000000000002','f0000000-0000-0000-0001-000000000001'),
('1e000000-0000-0000-0001-000000000003','f0000000-0000-0000-0001-000000000002'),
('1e000000-0000-0000-0001-000000000004','f0000000-0000-0000-0001-000000000002'),
('1e000000-0000-0000-0002-000000000001','f0000000-0000-0000-0002-000000000001'),
('1e000000-0000-0000-0002-000000000002','f0000000-0000-0000-0002-000000000001'),
('1e000000-0000-0000-0002-000000000003','f0000000-0000-0000-0002-000000000002'),
('1e000000-0000-0000-0002-000000000004','f0000000-0000-0000-0002-000000000002'),
('1e000000-0000-0000-0003-000000000001','f0000000-0000-0000-0003-000000000001'),
('1e000000-0000-0000-0003-000000000002','f0000000-0000-0000-0003-000000000001'),
('1e000000-0000-0000-0003-000000000003','f0000000-0000-0000-0003-000000000002'),
('1e000000-0000-0000-0003-000000000004','f0000000-0000-0000-0003-000000000002'),
('1e000000-0000-0000-0004-000000000001','f0000000-0000-0000-0004-000000000001'),
('1e000000-0000-0000-0004-000000000002','f0000000-0000-0000-0004-000000000001')
on conflict do nothing;

-- ════════════════════════════ NAVIGATION ════════════════════════════
-- "Gym Bags ▾" dropdown + Men / Women / New Arrivals (PRD §3 launch navbar).
insert into public.navigation_menu (id, label, link_type, link_target, parent_id, position, is_active) values
('11110000-0000-0000-0000-000000000001','Gym Bags','dropdown_parent',null,null,1,true),
('11110000-0000-0000-0000-000000000002','All Gym Bags','category','gym-bags','11110000-0000-0000-0000-000000000001',1,true),
('11110000-0000-0000-0000-000000000003','Men''s Gym Bags','collection','mens-gym-bags','11110000-0000-0000-0000-000000000001',2,true),
('11110000-0000-0000-0000-000000000004','Women''s Gym Bags','collection','womens-gym-bags','11110000-0000-0000-0000-000000000001',3,true),
('11110000-0000-0000-0000-000000000005','Men','collection','mens-gym-bags',null,2,true),
('11110000-0000-0000-0000-000000000006','Women','collection','womens-gym-bags',null,3,true),
('11110000-0000-0000-0000-000000000007','New Arrivals','collection','new-arrivals',null,4,true)
on conflict (id) do nothing;

-- reviews: intentionally EMPTY (PRD guardrail — never fabricate social proof).
