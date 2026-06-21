-- A second logo for dark backgrounds (e.g. the footer), since one image can't have
-- good contrast on both the white header and the dark footer. Nullable + additive.
alter table public.settings
  add column if not exists logo_url_dark text;
