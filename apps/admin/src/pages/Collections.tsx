import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { COLLECTION_TYPES, GENDERS, slugify, type SmartRules } from "@hudsten/shared";
import {
  deleteCollection,
  getCollectionProductIds,
  listCollections,
  setManualProducts,
  upsertCollection,
  type Collection,
  type CollectionInput,
} from "@/api/collections";
import { listProductRefs } from "@/api/reference";
import { listCategories } from "@/api/categories";
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
import { cn } from "@/lib/cn";

type CollectionType = (typeof COLLECTION_TYPES)[number];

// Local, fully-controlled form shape. We keep `rules` as a typed SmartRules draft
// so the builder edits a real object rather than serialized JSON, then we attach it
// (or null) to the upsert payload at save time.
interface FormState {
  id?: string;
  name: string;
  slug: string;
  type: CollectionType;
  description: string;
  image_url: string;
  position: number;
  is_active: boolean;
  meta_title: string;
  meta_description: string;
  rules: SmartRules;
}

const BLANK: FormState = {
  name: "",
  slug: "",
  type: "manual",
  description: "",
  image_url: "",
  position: 0,
  is_active: true,
  meta_title: "",
  meta_description: "",
  rules: {},
};

function toForm(c: Collection): FormState {
  const r = (c.rules ?? {}) as SmartRules;
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    type: c.type as CollectionType,
    description: c.description ?? "",
    image_url: c.image_url ?? "",
    position: c.position,
    is_active: c.is_active,
    meta_title: c.meta_title ?? "",
    meta_description: c.meta_description ?? "",
    rules: {
      ...(r.gender ? { gender: r.gender } : {}),
      ...(r.category ? { category: r.category } : {}),
      ...(r.tags ? { tags: r.tags } : {}),
      ...(r.price_min != null ? { price_min: r.price_min } : {}),
      ...(r.price_max != null ? { price_max: r.price_max } : {}),
    },
  };
}

// Drop empty rule fields so we never persist `{ gender: "" }` etc.
function cleanRules(rules: SmartRules): SmartRules {
  const out: SmartRules = {};
  if (rules.gender) out.gender = rules.gender;
  if (rules.category) out.category = rules.category;
  if (rules.tags?.length) out.tags = rules.tags;
  if (rules.price_min != null) out.price_min = rules.price_min;
  if (rules.price_max != null) out.price_max = rules.price_max;
  return out;
}

export default function Collections() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<FormState | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["collections"],
    queryFn: listCollections,
  });

  const del = useMutation({
    mutationFn: deleteCollection,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["collections"] }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Collections"
        description="Group products manually, or automatically by rule."
        actions={<Button onClick={() => setEditing({ ...BLANK })}>+ New collection</Button>}
      />

      {error && <ErrorNote error={error} />}
      {del.error && <ErrorNote error={del.error} />}

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="p-8 text-center">
            <Spinner />
          </div>
        ) : !data?.length ? (
          <p className="p-8 text-center text-sm text-stone-500">No collections yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-400">
              <tr>
                <th className="px-5 py-3 font-medium">Collection</th>
                <th className="px-3 py-3 font-medium">Type</th>
                <th className="px-3 py-3 font-medium">Position</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {data.map((c) => (
                <tr key={c.id} className="hover:bg-stone-50">
                  <td className="px-5 py-3">
                    <button
                      type="button"
                      onClick={() => setEditing(toForm(c))}
                      className="flex items-center gap-3 text-left"
                    >
                      {c.image_url ? (
                        <img
                          src={c.image_url}
                          alt=""
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <span className="h-10 w-10 rounded bg-stone-200" />
                      )}
                      <span>
                        <span className="block font-medium">{c.name}</span>
                        <span className="block text-xs text-stone-400">/{c.slug}</span>
                      </span>
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 text-2xs font-medium uppercase tracking-wide",
                        c.type === "smart"
                          ? "bg-brass-100 text-brass-800"
                          : "bg-stone-200 text-stone-600",
                      )}
                    >
                      {c.type}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-stone-500">{c.position}</td>
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 text-2xs font-medium uppercase tracking-wide",
                        c.is_active ? "bg-success/10 text-success" : "bg-stone-200 text-stone-500",
                      )}
                    >
                      {c.is_active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete "${c.name}"? This cannot be undone.`))
                          del.mutate(c.id);
                      }}
                      className="text-xs text-danger hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {editing && (
        <CollectionEditor
          key={editing.id ?? "new"}
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ["collections"] });
            // Manual membership changed → drop the cached per-collection product list.
            qc.invalidateQueries({ queryKey: ["collection-products"] });
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function CollectionEditor({
  initial,
  onClose,
  onSaved,
}: {
  initial: FormState;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = Boolean(initial.id);
  const [form, setForm] = useState<FormState>(initial);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const products = useQuery({ queryKey: ["product-refs"], queryFn: listProductRefs });
  const categories = useQuery({ queryKey: ["categories"], queryFn: listCategories });

  const membership = useQuery({
    queryKey: ["collection-products", initial.id],
    queryFn: () => getCollectionProductIds(initial.id!),
    enabled: isEdit && initial.type === "manual",
  });

  useEffect(() => {
    if (membership.data) setSelectedProductIds(membership.data);
  }, [membership.data]);

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));
  const setRule = (patch: Partial<SmartRules>) =>
    setForm((f) => ({ ...f, rules: { ...f.rules, ...patch } }));

  const onName = (name: string) =>
    set({ name, ...(slugTouched ? {} : { slug: slugify(name) }) });

  const toggleProduct = (id: string) =>
    setSelectedProductIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );

  const save = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error("Name is required");
      if (!form.slug.trim()) throw new Error("Slug is required");

      const rules = form.type === "smart" ? cleanRules(form.rules) : null;
      if (form.type === "smart" && Object.keys(rules ?? {}).length === 0) {
        throw new Error("Smart collections need at least one rule");
      }

      const input: CollectionInput = {
        ...(form.id ? { id: form.id } : {}),
        name: form.name.trim(),
        slug: form.slug.trim(),
        type: form.type,
        description: form.description.trim() || null,
        image_url: form.image_url.trim() || null,
        position: form.position,
        is_active: form.is_active,
        meta_title: form.meta_title.trim() || null,
        meta_description: form.meta_description.trim() || null,
        // SmartRules is structurally a Json object; null clears any prior rules.
        rules: rules as CollectionInput["rules"],
      };

      const savedId = await upsertCollection(input);
      if (form.type === "manual") {
        await setManualProducts(savedId, selectedProductIds);
      }
      return savedId;
    },
    onSuccess: onSaved,
    onError: (e) => setError(e instanceof Error ? e.message : "Save failed"),
  });

  // When editing a manual collection, block the form until membership has loaded
  // so we never overwrite it with an empty selection.
  const loadingMembership = isEdit && initial.type === "manual" && membership.isLoading;

  const categoryOptions = useMemo(
    () => (categories.data ?? []).filter((c) => c.is_active),
    [categories.data],
  );

  return (
    <Card
      title={isEdit ? "Edit collection" : "New collection"}
      actions={
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      }
    >
      {error && (
        <div className="mb-4">
          <ErrorNote error={error} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="c-name" className="sm:col-span-2">
          <Input id="c-name" value={form.name} onChange={(e) => onName(e.target.value)} />
        </Field>
        <Field label="Slug" htmlFor="c-slug" hint="URL: /collections/<slug>">
          <Input
            id="c-slug"
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set({ slug: e.target.value });
            }}
          />
        </Field>
        <Field label="Type" htmlFor="c-type">
          <Select
            id="c-type"
            value={form.type}
            onChange={(e) => set({ type: e.target.value as CollectionType })}
          >
            {COLLECTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Description" htmlFor="c-desc" className="sm:col-span-2">
          <Textarea
            id="c-desc"
            value={form.description}
            onChange={(e) => set({ description: e.target.value })}
          />
        </Field>
        <Field label="Image URL" htmlFor="c-img">
          <Input
            id="c-img"
            value={form.image_url}
            onChange={(e) => set({ image_url: e.target.value })}
          />
        </Field>
        <Field label="Position" htmlFor="c-pos" hint="Lower shows first">
          <Input
            id="c-pos"
            type="number"
            value={String(form.position)}
            onChange={(e) => set({ position: Number(e.target.value) })}
          />
        </Field>
        <div className="sm:col-span-2">
          <Toggle
            checked={form.is_active}
            onChange={(v) => set({ is_active: v })}
            label="Active (visible in storefront)"
          />
        </div>
      </div>

      {form.type === "smart" ? (
        <div className="mt-6 rounded-md border border-stone-200 bg-stone-50 p-4">
          <p className="mb-3 text-sm font-medium">Rules</p>
          <p className="mb-4 text-xs text-stone-500">
            Products matching all set conditions are added automatically.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Gender" htmlFor="r-gender">
              <Select
                id="r-gender"
                value={form.rules.gender ?? ""}
                onChange={(e) =>
                  setRule({
                    gender: e.target.value
                      ? (e.target.value as (typeof GENDERS)[number])
                      : undefined,
                  })
                }
              >
                <option value="">Any</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Category" htmlFor="r-cat">
              <Select
                id="r-cat"
                value={form.rules.category ?? ""}
                onChange={(e) => setRule({ category: e.target.value || undefined })}
                disabled={categories.isLoading}
              >
                <option value="">Any</option>
                {categoryOptions.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Min price (₹)" htmlFor="r-min">
              <Input
                id="r-min"
                type="number"
                value={form.rules.price_min == null ? "" : String(form.rules.price_min)}
                onChange={(e) =>
                  setRule({ price_min: e.target.value === "" ? undefined : Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Max price (₹)" htmlFor="r-max">
              <Input
                id="r-max"
                type="number"
                value={form.rules.price_max == null ? "" : String(form.rules.price_max)}
                onChange={(e) =>
                  setRule({ price_max: e.target.value === "" ? undefined : Number(e.target.value) })
                }
              />
            </Field>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-md border border-stone-200 bg-stone-50 p-4">
          <p className="mb-3 text-sm font-medium">
            Products{" "}
            <span className="font-normal text-stone-400">({selectedProductIds.length} selected)</span>
          </p>
          {products.error && <ErrorNote error={products.error} />}
          {products.isLoading || loadingMembership ? (
            <div className="py-6 text-center">
              <Spinner />
            </div>
          ) : !products.data?.length ? (
            <p className="py-4 text-sm text-stone-500">No products available.</p>
          ) : (
            <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
              {products.data.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedProductIds.includes(p.id)}
                    onChange={() => toggleProduct(p.id)}
                  />
                  {p.name}
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      <Card title="SEO" className="mt-6">
        <div className="space-y-4">
          <Field label="Meta title" htmlFor="c-mt">
            <Input
              id="c-mt"
              value={form.meta_title}
              onChange={(e) => set({ meta_title: e.target.value })}
            />
          </Field>
          <Field label="Meta description" htmlFor="c-md">
            <Textarea
              id="c-md"
              value={form.meta_description}
              onChange={(e) => set({ meta_description: e.target.value })}
            />
          </Field>
        </div>
      </Card>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => save.mutate()} disabled={save.isPending || loadingMembership}>
          {save.isPending ? "Saving…" : isEdit ? "Save changes" : "Create collection"}
        </Button>
      </div>
    </Card>
  );
}
