-- Batch 2 (PDP conversion): delivery expectation line + product video support.

-- 1) Admin-editable shipping line shown near the PDP CTA.
alter table public.settings
  add column if not exists delivery_note text;

comment on column public.settings.delivery_note is
  'Shipping expectation line near the PDP CTA, e.g. "Free shipping · ships in 24-48h".';

-- 2) video_url spec field on the Bag product type (renders as the last gallery
--    slide on the PDP). Idempotent: appended only if the key is not already present.
update public.product_types
set spec_schema = spec_schema || jsonb_build_array(
  jsonb_build_object(
    'key', 'video_url',
    'label', 'Product video URL',
    'type', 'text',
    'group', 'Media',
    'help', 'YouTube link or direct .mp4 URL — shown as the last gallery slide.'
  )
)
where name = 'Bag'
  and not exists (
    select 1
    from jsonb_array_elements(spec_schema) as f
    where f->>'key' = 'video_url'
  );
