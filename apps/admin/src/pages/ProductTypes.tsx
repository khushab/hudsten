import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SPEC_FIELD_TYPES, type SpecField, type SpecSchema } from "@hudsten/shared";
import {
  deleteProductType,
  listProductTypes,
  upsertProductType,
  type ProductTypeRow,
} from "@/api/productTypes";
import { Button, Card, ErrorNote, Field, Input, PageHeader, Select, Spinner } from "@/components/ui";
import { cn } from "@/lib/cn";

// Editor-local field shape: identical to SpecField but holds `options` as a raw
// comma-separated string while editing, so the input stays controllable. We map
// back to SpecField[] (options -> string[]) at save time.
interface DraftField {
  key: string;
  label: string;
  type: string;
  unit: string;
  group: string;
  options: string;
}

interface Draft {
  id?: string;
  name: string;
  fields: DraftField[];
}

const BLANK_DRAFT: Draft = { name: "", fields: [] };

const BLANK_FIELD: DraftField = {
  key: "",
  label: "",
  type: "text",
  unit: "",
  group: "",
  options: "",
};

function rowToDraft(row: ProductTypeRow): Draft {
  const schema = (row.spec_schema ?? []) as unknown as SpecSchema;
  return {
    id: row.id,
    name: row.name,
    fields: schema.map((f) => ({
      key: f.key,
      label: f.label,
      type: f.type,
      unit: f.unit ?? "",
      group: f.group ?? "",
      options: (f.options ?? []).join(", "),
    })),
  };
}

function draftToSchema(draft: Draft): SpecField[] {
  return draft.fields.map((f) => {
    const field: SpecField = {
      key: f.key.trim(),
      label: f.label.trim(),
      // Cast: DraftField.type is a plain string while editing; the Select only
      // ever emits SPEC_FIELD_TYPES values, so the union is sound at save time.
      type: f.type as SpecField["type"],
    };
    if (f.unit.trim()) field.unit = f.unit.trim();
    if (f.group.trim()) field.group = f.group.trim();
    if (f.type === "select") {
      field.options = f.options
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);
    }
    return field;
  });
}

export default function ProductTypes() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["product-types"],
    queryFn: listProductTypes,
  });

  const save = useMutation({
    mutationFn: (d: Draft) =>
      upsertProductType({
        ...(d.id ? { id: d.id } : {}),
        name: d.name.trim(),
        spec_schema: draftToSchema(d),
      }),
    onSuccess: (savedId) => {
      qc.invalidateQueries({ queryKey: ["product-types"] });
      setDraft((d) => (d ? { ...d, id: savedId } : d));
    },
  });

  const del = useMutation({
    mutationFn: deleteProductType,
    onSuccess: (_void, id) => {
      qc.invalidateQueries({ queryKey: ["product-types"] });
      setDraft((d) => (d?.id === id ? null : d));
    },
  });

  const patchField = (index: number, patch: Partial<DraftField>) =>
    setDraft((d) =>
      d
        ? { ...d, fields: d.fields.map((f, i) => (i === index ? { ...f, ...patch } : f)) }
        : d,
    );

  const addField = () =>
    setDraft((d) => (d ? { ...d, fields: [...d.fields, { ...BLANK_FIELD }] } : d));

  const removeField = (index: number) =>
    setDraft((d) => (d ? { ...d, fields: d.fields.filter((_, i) => i !== index) } : d));

  return (
    <div>
      <PageHeader
        title="Product types"
        description="Each type owns a spec schema — the expansion control that lets you sell new product lines with zero migration."
        actions={<Button onClick={() => setDraft({ ...BLANK_DRAFT, fields: [] })}>+ New type</Button>}
      />

      {error && <ErrorNote error={error} />}
      {del.error && <ErrorNote error={del.error} />}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* ── Left: list ── */}
        <Card title="Types" className="overflow-hidden p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <Spinner />
            </div>
          ) : !data?.length ? (
            <p className="p-6 text-center text-sm text-stone-500">No product types yet.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {data.map((t) => (
                <li
                  key={t.id}
                  className={cn(
                    "flex items-center justify-between gap-2 px-4 py-2.5 text-sm hover:bg-stone-50",
                    draft?.id === t.id && "bg-stone-50",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setDraft(rowToDraft(t))}
                    className="flex-1 truncate text-left font-medium"
                  >
                    {t.name}
                  </button>
                  <span className="text-2xs text-stone-400">
                    {((t.spec_schema ?? []) as unknown as SpecSchema).length} fields
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete "${t.name}"? This cannot be undone.`)) del.mutate(t.id);
                    }}
                    className="text-xs text-danger hover:underline"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* ── Right: editor ── */}
        {!draft ? (
          <Card>
            <p className="py-12 text-center text-sm text-stone-500">
              Select a type to edit, or create a new one.
            </p>
          </Card>
        ) : (
          <Card
            title={draft.id ? "Edit type" : "New type"}
            actions={
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setDraft(null)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => save.mutate(draft)}
                  disabled={!draft.name.trim() || save.isPending}
                >
                  {save.isPending ? "Saving…" : "Save"}
                </Button>
              </div>
            }
          >
            {save.error && (
              <div className="mb-4">
                <ErrorNote error={save.error} />
              </div>
            )}

            <Field label="Name" htmlFor="pt-name" hint="e.g. Backpack, T-shirt, Wallet">
              <Input
                id="pt-name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </Field>

            <div className="mt-6 mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Spec fields</h3>
              <Button variant="secondary" size="sm" onClick={addField}>
                + Add field
              </Button>
            </div>

            {!draft.fields.length ? (
              <p className="rounded-md border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-500">
                No spec fields. Add one to define this type's specifications.
              </p>
            ) : (
              <div className="space-y-4">
                {draft.fields.map((f, i) => (
                  <div
                    key={i}
                    className="rounded-md border border-stone-200 bg-stone-50/50 p-4"
                  >
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <Field label="Key" hint="snake_case, e.g. capacity_l">
                        <Input
                          value={f.key}
                          placeholder="capacity_l"
                          onChange={(e) => patchField(i, { key: e.target.value })}
                        />
                      </Field>
                      <Field label="Label">
                        <Input
                          value={f.label}
                          placeholder="Capacity"
                          onChange={(e) => patchField(i, { label: e.target.value })}
                        />
                      </Field>
                      <Field label="Type">
                        <Select
                          value={f.type}
                          onChange={(e) => patchField(i, { type: e.target.value })}
                        >
                          {SPEC_FIELD_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </Select>
                      </Field>
                      <Field label="Unit" hint="Optional, e.g. L, kg, cm">
                        <Input
                          value={f.unit}
                          onChange={(e) => patchField(i, { unit: e.target.value })}
                        />
                      </Field>
                      <Field label="Group" hint="Optional, e.g. Dimensions">
                        <Input
                          value={f.group}
                          onChange={(e) => patchField(i, { group: e.target.value })}
                        />
                      </Field>
                      {f.type === "select" && (
                        <Field label="Options" hint="Comma-separated">
                          <Input
                            value={f.options}
                            placeholder="Small, Medium, Large"
                            onChange={(e) => patchField(i, { options: e.target.value })}
                          />
                        </Field>
                      )}
                    </div>
                    <div className="mt-3 text-right">
                      <button
                        type="button"
                        onClick={() => removeField(i)}
                        className="text-xs text-danger hover:underline"
                      >
                        Remove field
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
