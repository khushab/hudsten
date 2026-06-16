import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GENDERS,
  PRODUCT_STATUSES,
  SUGGESTED_BADGES,
  productCoreSchema,
  slugify,
} from "@hudsten/shared";
import {
  getProductForEdit,
  saveProduct,
  type ProductEditorPayload,
} from "@/api/products";
import { listCategoryRefs, listCollectionRefs, listTags, ensureTag } from "@/api/reference";
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
  Toggle,
} from "@/components/ui";
import { RichText } from "@/components/RichText";
import { cn } from "@/lib/cn";
import { OptionsVariants } from "./editor/OptionsVariants";
import { ImagesEditor } from "./editor/ImagesEditor";
import { EditorialBlocksEditor } from "./editor/EditorialBlocksEditor";

// Pre-seeded on NEW products only (editable, empty answers) so the merchant has a
// ready FAQ scaffold instead of a blank slate.
const DEFAULT_FAQS = [
  "What's in the box?",
  "How do I care for it?",
  "Is there a warranty?",
  "Shipping & delivery?",
  "Returns & exchanges?",
].map((question) => ({ question, answer: "" }));

const BLANK: ProductEditorPayload = {
  core: {
    title: "",
    slug: "",
    description: "",
    details: null,
    specifications: null,
    category_id: null,
    gender: "unisex",
    price: 0,
    compare_at_price: null,
    currency: "INR",
    status: "draft",
    in_stock: true,
    video_url: null,
    faqs: DEFAULT_FAQS,
    editorial_blocks: [],
    whatsapp_message_template: null,
    amazon_url: null,
    is_featured: false,
    badges: [],
    meta_title: null,
    meta_description: null,
  },
  options: [],
  variants: [],
  images: [],
  collectionIds: [],
  tagIds: [],
};

export default function ProductEditor() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [payload, setPayload] = useState<ProductEditorPayload>(BLANK);
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reference data
  const categories = useQuery({ queryKey: ["cat-refs"], queryFn: listCategoryRefs });
  const collections = useQuery({ queryKey: ["col-refs"], queryFn: listCollectionRefs });
  const tags = useQuery({ queryKey: ["tags"], queryFn: listTags });

  const existing = useQuery({
    queryKey: ["product-edit", id],
    queryFn: () => getProductForEdit(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing.data) {
      setPayload(existing.data);
      setSlugTouched(true);
    }
  }, [existing.data]);

  const core = payload.core;
  const setCore = (patch: Partial<ProductEditorPayload["core"]>) =>
    setPayload((p) => ({ ...p, core: { ...p.core, ...patch } }));

  // Auto-slug from title until the slug is manually edited.
  const onTitle = (title: string) =>
    setCore({ title, ...(slugTouched ? {} : { slug: slugify(title) }) });

  const colorValues = useMemo(() => {
    const colorOpt = payload.options.find((o) => o.name.toLowerCase() === "color");
    return (colorOpt?.values ?? []).map((v) => ({ key: v.key, value: v.value }));
  }, [payload.options]);

  const save = useMutation({
    mutationFn: async () => {
      // Core validation (incl. honest-discount refine).
      const parsed = productCoreSchema.safeParse(core);
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Please check the form");
      }
      // Validate the relational graph the core schema doesn't cover.
      for (const o of payload.options) {
        if (!o.name.trim()) throw new Error("Every option needs a name.");
        if (o.values.length === 0)
          throw new Error(`Option "${o.name}" needs at least one value.`);
        if (o.values.some((v) => !v.value.trim()))
          throw new Error(`Option "${o.name}" has a blank value.`);
      }
      if (
        core.compare_at_price != null &&
        core.compare_at_price !== 0 &&
        core.compare_at_price <= core.price
      ) {
        throw new Error("Compare-at price must exceed the price (honest anchor).");
      }
      for (const v of payload.variants) {
        const effectivePrice = v.price ?? core.price;
        if (
          v.compare_at_price != null &&
          v.compare_at_price !== 0 &&
          v.compare_at_price <= effectivePrice
        ) {
          throw new Error(
            `Variant "${v.title}": compare-at must exceed price (no fake discounts).`,
          );
        }
      }
      return saveProduct(payload);
    },
    onSuccess: (savedId) => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product-edit", savedId] });
      if (!isEdit) navigate(`/products/${savedId}`, { replace: true });
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Save failed"),
  });

  const newTag = useMutation({
    mutationFn: (name: string) => ensureTag(name),
    onSuccess: (tagId) => {
      qc.invalidateQueries({ queryKey: ["tags"] });
      setPayload((p) => ({ ...p, tagIds: Array.from(new Set([...p.tagIds, tagId])) }));
    },
  });

  const toggleBadge = (b: string) =>
    setCore({
      badges: core.badges.includes(b)
        ? core.badges.filter((x) => x !== b)
        : [...core.badges, b],
    });

  const toggleId = (list: string[], idv: string) =>
    list.includes(idv) ? list.filter((x) => x !== idv) : [...list, idv];

  if (isEdit && existing.isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        title={isEdit ? "Edit product" : "New product"}
        actions={
          <Button variant="ghost" onClick={() => navigate("/products")}>
            ← Back
          </Button>
        }
      />

      {error && <ErrorNote error={error} />}

      {/* Info */}
      <Card title="Product info">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" htmlFor="title" className="sm:col-span-2">
            <Input id="title" value={core.title} onChange={(e) => onTitle(e.target.value)} />
          </Field>
          <Field label="Slug" htmlFor="slug" hint="Locked URL: /p/<slug>">
            <Input
              id="slug"
              value={core.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setCore({ slug: e.target.value });
              }}
            />
          </Field>
          <Field label="Description" htmlFor="desc" className="sm:col-span-2">
            <RichText
              id="desc"
              value={core.description}
              onChange={(html) => setCore({ description: html })}
            />
          </Field>
          <Field label="Primary category" htmlFor="cat">
            <Select
              id="cat"
              value={core.category_id ?? ""}
              onChange={(e) => setCore({ category_id: e.target.value || null })}
            >
              <option value="">None</option>
              {categories.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Gender" htmlFor="gender">
            <Select
              id="gender"
              value={core.gender}
              onChange={(e) => setCore({ gender: e.target.value as (typeof GENDERS)[number] })}
            >
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Price (₹)" htmlFor="price">
            <Input
              id="price"
              type="number"
              value={String(core.price)}
              onChange={(e) => setCore({ price: Number(e.target.value) })}
            />
          </Field>
          <Field label="Compare-at price (₹)" htmlFor="compare" hint="Must exceed price (honest anchor)">
            <Input
              id="compare"
              type="number"
              value={core.compare_at_price == null ? "" : String(core.compare_at_price)}
              onChange={(e) =>
                setCore({ compare_at_price: e.target.value === "" ? null : Number(e.target.value) })
              }
            />
          </Field>
          <Field label="Status" htmlFor="status">
            <Select
              id="status"
              value={core.status}
              onChange={(e) =>
                setCore({ status: e.target.value as (typeof PRODUCT_STATUSES)[number] })
              }
            >
              {PRODUCT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex items-center gap-6 sm:col-span-2">
            <Toggle checked={core.in_stock} onChange={(v) => setCore({ in_stock: v })} label="In stock" />
            <Toggle
              checked={core.is_featured}
              onChange={(v) => setCore({ is_featured: v })}
              label="Featured on home"
            />
          </div>
          <Field label="Badges" className="sm:col-span-2">
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_BADGES.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => toggleBadge(b)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    core.badges.includes(b)
                      ? "border-ink bg-ink text-paper"
                      : "border-stone-300 hover:border-ink",
                  )}
                >
                  {b}
                </button>
              ))}
            </div>
          </Field>
        </div>
      </Card>

      {/* Content — long-form PDP copy */}
      <Card title="Content">
        <div className="space-y-4">
          <Field label="Details" htmlFor="details">
            <RichText
              id="details"
              value={core.details}
              onChange={(html) => setCore({ details: html || null })}
            />
          </Field>
          <Field label="Specifications" htmlFor="specs">
            <RichText
              id="specs"
              value={core.specifications}
              onChange={(html) => setCore({ specifications: html || null })}
            />
          </Field>
          <Field
            label="Product video URL"
            htmlFor="video"
            hint="Optional. YouTube link or a direct .mp4 URL."
          >
            <Input
              id="video"
              value={core.video_url ?? ""}
              onChange={(e) => setCore({ video_url: e.target.value || null })}
              placeholder="https://…"
            />
          </Field>
        </div>
      </Card>

      {/* Options & variants */}
      <Card title="Options & variants">
        <OptionsVariants
          options={payload.options}
          variants={payload.variants}
          basePrice={core.price}
          baseCompareAt={core.compare_at_price}
          onOptions={(options) => setPayload((p) => ({ ...p, options }))}
          onVariants={(variants) => setPayload((p) => ({ ...p, variants }))}
        />
      </Card>

      {/* Images */}
      <Card title="Images (tag each to a color)">
        <ImagesEditor
          images={payload.images}
          colorValues={colorValues}
          onImages={(images) => setPayload((p) => ({ ...p, images }))}
        />
      </Card>

      {/* FAQ */}
      <Card
        title="FAQ"
        actions={
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              setCore({ faqs: [...core.faqs, { question: "", answer: "" }] })
            }
          >
            + Add question
          </Button>
        }
      >
        {core.faqs.length === 0 ? (
          <p className="text-sm text-stone-500">No questions yet.</p>
        ) : (
          <div className="space-y-4">
            {core.faqs.map((f, i) => (
              <div key={i} className="space-y-2 rounded-md border border-stone-200 p-3">
                <div className="flex items-start gap-2">
                  <Input
                    placeholder="Question"
                    value={f.question}
                    onChange={(e) =>
                      setCore({
                        faqs: core.faqs.map((x, idx) =>
                          idx === i ? { ...x, question: e.target.value } : x,
                        ),
                      })
                    }
                  />
                  <button
                    type="button"
                    aria-label="Remove question"
                    onClick={() =>
                      setCore({ faqs: core.faqs.filter((_, idx) => idx !== i) })
                    }
                    className="mt-1 shrink-0 px-1 text-stone-400 hover:text-danger"
                  >
                    ✕
                  </button>
                </div>
                <Textarea
                  placeholder="Answer"
                  value={f.answer}
                  onChange={(e) =>
                    setCore({
                      faqs: core.faqs.map((x, idx) =>
                        idx === i ? { ...x, answer: e.target.value } : x,
                      ),
                    })
                  }
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Editorial blocks */}
      <Card
        title="Editorial blocks"
        actions={
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              setCore({
                editorial_blocks: [
                  ...core.editorial_blocks,
                  { image_url: null, heading: "", body: "" },
                ],
              })
            }
          >
            + Add block
          </Button>
        }
      >
        <EditorialBlocksEditor
          blocks={core.editorial_blocks}
          onChange={(editorial_blocks) => setCore({ editorial_blocks })}
        />
      </Card>

      {/* CTAs */}
      <Card title="Buy CTAs">
        <div className="space-y-4">
          <Field
            label="WhatsApp message template"
            htmlFor="wa"
            hint="Overrides the store default. Placeholders: {product} {variant} {price} {url}"
          >
            <Textarea
              id="wa"
              value={core.whatsapp_message_template ?? ""}
              onChange={(e) =>
                setCore({ whatsapp_message_template: e.target.value || null })
              }
            />
          </Field>
          <Field label="Amazon URL" htmlFor="amz" hint="Optional. Shown as the secondary CTA.">
            <Input
              id="amz"
              value={core.amazon_url ?? ""}
              onChange={(e) => setCore({ amazon_url: e.target.value || null })}
            />
          </Field>
        </div>
      </Card>

      {/* Organization */}
      <Card title="Collections & tags">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium">Collections (manual)</p>
            <div className="space-y-1.5">
              {collections.data?.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={payload.collectionIds.includes(c.id)}
                    onChange={() =>
                      setPayload((p) => ({
                        ...p,
                        collectionIds: toggleId(p.collectionIds, c.id),
                      }))
                    }
                  />
                  {c.name}
                </label>
              ))}
              <p className="text-xs text-stone-400">
                Smart collections add products automatically by rule.
              </p>
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Tags</p>
            <div className="space-y-1.5">
              {tags.data?.map((t) => (
                <label key={t.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={payload.tagIds.includes(t.id)}
                    onChange={() =>
                      setPayload((p) => ({ ...p, tagIds: toggleId(p.tagIds, t.id) }))
                    }
                  />
                  {t.name}
                </label>
              ))}
            </div>
            <AddTag onAdd={(name) => newTag.mutate(name)} />
          </div>
        </div>
      </Card>

      {/* SEO */}
      <Card title="SEO">
        <div className="space-y-4">
          <Field label="Meta title" htmlFor="mt">
            <Input
              id="mt"
              value={core.meta_title ?? ""}
              onChange={(e) => setCore({ meta_title: e.target.value || null })}
            />
          </Field>
          <Field label="Meta description" htmlFor="md">
            <Textarea
              id="md"
              value={core.meta_description ?? ""}
              onChange={(e) => setCore({ meta_description: e.target.value || null })}
            />
          </Field>
        </div>
      </Card>

      {/* Sticky save bar — starts after the 240px (w-60) sidebar so it never covers it. */}
      <div className="fixed bottom-0 left-60 right-0 z-40 border-t border-stone-200 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-end gap-3 px-6 py-3">
          <Button variant="ghost" onClick={() => navigate("/products")}>
            Cancel
          </Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Saving…" : isEdit ? "Save changes" : "Create product"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function AddTag({ onAdd }: { onAdd: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <div className="mt-3 flex gap-2">
      <Input
        placeholder="New tag…"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-8 text-xs"
      />
      <Button
        size="sm"
        variant="secondary"
        onClick={() => {
          if (name.trim()) {
            onAdd(name.trim());
            setName("");
          }
        }}
      >
        Add
      </Button>
    </div>
  );
}
