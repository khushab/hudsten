import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSettingsRow, updateSettings, type SettingsRow } from "@/api/settings";
import { listCollectionRefs } from "@/api/reference";
import {
  Button,
  Card,
  ErrorNote,
  Field,
  Input,
  PageHeader,
  Select,
  Spinner,
  Textarea,
} from "@/components/ui";

// JSONB shapes are stored loosely; we edit them as flat string maps.
type StrMap = Record<string, string>;

interface FormState {
  store_name: string;
  logo_url: string;
  announcement_bar: string;
  whatsapp_number: string;
  whatsapp_default_message_template: string;
  delivery_note: string;
  featured_collection_id: string;
  contact_email: string;
  phone: string;
  address: string;
  gst_number: string;
  hero: StrMap;
  social: StrMap;
  policies: StrMap;
}

const BLANK: FormState = {
  store_name: "",
  logo_url: "",
  announcement_bar: "",
  whatsapp_number: "",
  whatsapp_default_message_template: "",
  delivery_note: "",
  featured_collection_id: "",
  contact_email: "",
  phone: "",
  address: "",
  gst_number: "",
  hero: {},
  social: {},
  policies: {},
};

// Empty text → null so we don't persist "" into nullable columns.
const orNull = (v: string): string | null => (v.trim() === "" ? null : v);

function seedFrom(row: SettingsRow): FormState {
  return {
    store_name: row.store_name ?? "",
    logo_url: row.logo_url ?? "",
    announcement_bar: row.announcement_bar ?? "",
    whatsapp_number: row.whatsapp_number ?? "",
    whatsapp_default_message_template: row.whatsapp_default_message_template ?? "",
    delivery_note: row.delivery_note ?? "",
    featured_collection_id: row.featured_collection_id ?? "",
    contact_email: row.contact_email ?? "",
    phone: row.phone ?? "",
    address: row.address ?? "",
    gst_number: row.gst_number ?? "",
    hero: (row.hero as StrMap | null) ?? {},
    social: (row.social as StrMap | null) ?? {},
    policies: (row.policies as StrMap | null) ?? {},
  };
}

export default function Settings() {
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState>(BLANK);
  const [saved, setSaved] = useState(false);

  const settings = useQuery({ queryKey: ["settings"], queryFn: getSettingsRow });
  const collections = useQuery({ queryKey: ["col-refs"], queryFn: listCollectionRefs });

  useEffect(() => {
    if (settings.data) setForm(seedFrom(settings.data));
  }, [settings.data]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  };

  const setObj = (key: "hero" | "social" | "policies", field: string, value: string) =>
    set(key, { ...form[key], [field]: value });

  const save = useMutation({
    mutationFn: () =>
      updateSettings({
        store_name: form.store_name,
        logo_url: orNull(form.logo_url),
        announcement_bar: orNull(form.announcement_bar),
        whatsapp_number: orNull(form.whatsapp_number),
        whatsapp_default_message_template: orNull(form.whatsapp_default_message_template),
        delivery_note: orNull(form.delivery_note),
        featured_collection_id: orNull(form.featured_collection_id),
        contact_email: orNull(form.contact_email),
        phone: orNull(form.phone),
        address: orNull(form.address),
        gst_number: orNull(form.gst_number),
        hero: form.hero,
        social: form.social,
        policies: form.policies,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      setSaved(true);
    },
  });

  if (settings.isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        title="Store settings"
        description="Storefront config — branding, the WhatsApp CTA, contact details, and policies."
      />

      {settings.error && <ErrorNote error={settings.error} />}
      {save.error && <ErrorNote error={save.error} />}

      {/* Store */}
      <Card title="Store">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Store name" htmlFor="store_name" className="sm:col-span-2">
            <Input
              id="store_name"
              value={form.store_name}
              onChange={(e) => set("store_name", e.target.value)}
            />
          </Field>
          <Field label="Logo URL" htmlFor="logo_url">
            <Input
              id="logo_url"
              value={form.logo_url}
              onChange={(e) => set("logo_url", e.target.value)}
            />
          </Field>
          <Field
            label="Announcement bar"
            htmlFor="announcement_bar"
            hint="Shown across the top of the storefront. Leave blank to hide."
          >
            <Input
              id="announcement_bar"
              value={form.announcement_bar}
              onChange={(e) => set("announcement_bar", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      {/* WhatsApp — primary CTA, made prominent. */}
      <Card
        title="WhatsApp (primary CTA)"
        className="border-brass-300 ring-1 ring-brass-200"
      >
        <div className="space-y-4">
          <Field
            label="WhatsApp number"
            htmlFor="whatsapp_number"
            hint="With country code, e.g. 919876543210. This powers every Buy button."
          >
            <Input
              id="whatsapp_number"
              value={form.whatsapp_number}
              onChange={(e) => set("whatsapp_number", e.target.value)}
              placeholder="919876543210"
            />
          </Field>
          <Field
            label="Default message template"
            htmlFor="wa_template"
            hint="Placeholders: {product} {variant} {price} {url}. Products may override this."
          >
            <Textarea
              id="wa_template"
              className="min-h-28"
              value={form.whatsapp_default_message_template}
              onChange={(e) => set("whatsapp_default_message_template", e.target.value)}
              placeholder="Hi! I'd like to order {product} ({variant}) — {price}. {url}"
            />
          </Field>
          <Field
            label="Delivery note"
            htmlFor="delivery_note"
            hint="Shown under the Buy buttons. Keep it honest — e.g. shipping cost + realistic delivery window."
          >
            <Input
              id="delivery_note"
              value={form.delivery_note}
              onChange={(e) => set("delivery_note", e.target.value)}
              placeholder="Free shipping across India · usually 3–7 business days"
            />
          </Field>
        </div>
      </Card>

      {/* Hero */}
      <Card title="Hero">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Image URL" htmlFor="hero_image" className="sm:col-span-2">
            <Input
              id="hero_image"
              value={form.hero.image_url ?? ""}
              onChange={(e) => setObj("hero", "image_url", e.target.value)}
            />
          </Field>
          <Field label="Headline" htmlFor="hero_headline">
            <Input
              id="hero_headline"
              value={form.hero.headline ?? ""}
              onChange={(e) => setObj("hero", "headline", e.target.value)}
            />
          </Field>
          <Field label="Subtext" htmlFor="hero_subtext">
            <Input
              id="hero_subtext"
              value={form.hero.subtext ?? ""}
              onChange={(e) => setObj("hero", "subtext", e.target.value)}
            />
          </Field>
          <Field label="CTA label" htmlFor="hero_cta_label">
            <Input
              id="hero_cta_label"
              value={form.hero.cta_label ?? ""}
              onChange={(e) => setObj("hero", "cta_label", e.target.value)}
            />
          </Field>
          <Field label="CTA link" htmlFor="hero_cta_link">
            <Input
              id="hero_cta_link"
              value={form.hero.cta_link ?? ""}
              onChange={(e) => setObj("hero", "cta_link", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      {/* Homepage */}
      <Card title="Homepage">
        <Field
          label="Featured collection"
          htmlFor="featured_collection_id"
          hint="Shown as the highlighted collection on the home page."
        >
          <Select
            id="featured_collection_id"
            value={form.featured_collection_id}
            onChange={(e) => set("featured_collection_id", e.target.value)}
            disabled={collections.isLoading}
          >
            <option value="">None</option>
            {collections.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        {collections.error && <ErrorNote error={collections.error} />}
      </Card>

      {/* Contact & GST */}
      <Card title="Contact & GST">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact email" htmlFor="contact_email">
            <Input
              id="contact_email"
              type="email"
              value={form.contact_email}
              onChange={(e) => set("contact_email", e.target.value)}
            />
          </Field>
          <Field label="Phone" htmlFor="phone">
            <Input id="phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="Address" htmlFor="address" className="sm:col-span-2">
            <Textarea
              id="address"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </Field>
          <Field label="GST number" htmlFor="gst_number">
            <Input
              id="gst_number"
              value={form.gst_number}
              onChange={(e) => set("gst_number", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      {/* Social */}
      <Card title="Social">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Instagram" htmlFor="social_instagram">
            <Input
              id="social_instagram"
              value={form.social.instagram ?? ""}
              onChange={(e) => setObj("social", "instagram", e.target.value)}
            />
          </Field>
          <Field label="Facebook" htmlFor="social_facebook">
            <Input
              id="social_facebook"
              value={form.social.facebook ?? ""}
              onChange={(e) => setObj("social", "facebook", e.target.value)}
            />
          </Field>
          <Field label="YouTube" htmlFor="social_youtube">
            <Input
              id="social_youtube"
              value={form.social.youtube ?? ""}
              onChange={(e) => setObj("social", "youtube", e.target.value)}
            />
          </Field>
          <Field label="X (Twitter)" htmlFor="social_x">
            <Input
              id="social_x"
              value={form.social.x ?? ""}
              onChange={(e) => setObj("social", "x", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      {/* Policies */}
      <Card title="Policies">
        <div className="space-y-4">
          <Field label="Privacy policy (HTML)" htmlFor="policy_privacy">
            <Textarea
              id="policy_privacy"
              className="min-h-32"
              value={form.policies.privacy ?? ""}
              onChange={(e) => setObj("policies", "privacy", e.target.value)}
            />
          </Field>
          <Field label="Terms (HTML)" htmlFor="policy_terms">
            <Textarea
              id="policy_terms"
              className="min-h-32"
              value={form.policies.terms ?? ""}
              onChange={(e) => setObj("policies", "terms", e.target.value)}
            />
          </Field>
          <Field label="Shipping (HTML)" htmlFor="policy_shipping">
            <Textarea
              id="policy_shipping"
              className="min-h-32"
              value={form.policies.shipping ?? ""}
              onChange={(e) => setObj("policies", "shipping", e.target.value)}
            />
          </Field>
          <Field label="Returns (HTML)" htmlFor="policy_returns">
            <Textarea
              id="policy_returns"
              className="min-h-32"
              value={form.policies.returns ?? ""}
              onChange={(e) => setObj("policies", "returns", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      {/* Sticky save bar — starts after the 240px (w-60) sidebar so it never covers it. */}
      <div className="fixed bottom-0 left-60 right-0 z-40 border-t border-stone-200 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-end gap-3 px-6 py-3">
          {saved && !save.isPending && (
            <span className="text-sm text-success">Saved ✓</span>
          )}
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
