import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NAV_LINK_TYPES, type NavLinkType } from "@hudsten/shared";
import {
  deleteNavItem,
  listNav,
  reorderNav,
  upsertNavItem,
  type NavInput,
  type NavRow,
} from "@/api/navigation";
import { useConfirm } from "@/components/Confirm";
import {
  Button,
  Card,
  ErrorNote,
  Field,
  Input,
  PageHeader,
  Select,
  Spinner,
  Toggle,
} from "@/components/ui";
import { cn } from "@/lib/cn";

// Hint shown under the link_target field — what to type per link type.
const TARGET_HINT: Record<NavLinkType, string> = {
  category: "Category slug, e.g. men-watches",
  collection: "Collection slug, e.g. summer-2026",
  url: "Full URL or path, e.g. /sale or https://…",
  dropdown_parent: "No target — this item only groups its children.",
};

const LINK_TYPE_LABEL: Record<NavLinkType, string> = {
  category: "Category",
  collection: "Collection",
  url: "URL",
  dropdown_parent: "Dropdown",
};

type FormState = {
  id?: string;
  label: string;
  link_type: NavLinkType;
  link_target: string;
  parent_id: string; // "" === none
  position: number;
  is_active: boolean;
};

const BLANK: FormState = {
  label: "",
  link_type: "category",
  link_target: "",
  parent_id: "",
  position: 0,
  is_active: true,
};

function rowToForm(row: NavRow): FormState {
  return {
    id: row.id,
    label: row.label,
    link_type: row.link_type,
    link_target: row.link_target ?? "",
    parent_id: row.parent_id ?? "",
    position: row.position,
    is_active: row.is_active,
  };
}

export default function Navigation() {
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState>(BLANK);

  const { data, isLoading, error } = useQuery({
    queryKey: ["navigation"],
    queryFn: listNav,
  });

  const items = useMemo(() => data ?? [], [data]);

  // dropdown_parent items are the only valid parents.
  const dropdownParents = useMemo(
    () => items.filter((i) => i.link_type === "dropdown_parent"),
    [items],
  );

  // Build parent → sorted children index once, then derive top-level + nesting from it.
  const childrenByParent = useMemo(() => {
    const map = new Map<string | null, NavRow[]>();
    for (const item of items) {
      const key = item.parent_id;
      const bucket = map.get(key);
      if (bucket) bucket.push(item);
      else map.set(key, [item]);
    }
    for (const bucket of map.values()) {
      bucket.sort((a, b) => a.position - b.position);
    }
    return map;
  }, [items]);

  const topLevel = childrenByParent.get(null) ?? [];

  const save = useMutation({
    mutationFn: (input: NavInput) => upsertNavItem(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["navigation"] });
      setForm(BLANK);
    },
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteNavItem(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["navigation"] }),
  });
  const confirm = useConfirm();

  const move = useMutation({
    mutationFn: (updates: { id: string; position: number; parent_id: string | null }[]) =>
      reorderNav(updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["navigation"] }),
  });

  const isEdit = Boolean(form.id);

  const onSave = () => {
    const input: NavInput = {
      ...(form.id ? { id: form.id } : {}),
      label: form.label.trim(),
      link_type: form.link_type,
      // dropdown_parent never carries a target; everything else stores trimmed text or null.
      link_target:
        form.link_type === "dropdown_parent" ? null : form.link_target.trim() || null,
      parent_id: form.parent_id || null,
      position: Number.isFinite(form.position) ? form.position : 0,
      is_active: form.is_active,
    };
    save.mutate(input);
  };

  // Swap an item's position with its adjacent sibling (same parent), then persist both.
  const moveWithinSiblings = (item: NavRow, dir: -1 | 1) => {
    const siblings = [...(childrenByParent.get(item.parent_id) ?? [])];
    const idx = siblings.findIndex((s) => s.id === item.id);
    const swapIdx = idx + dir;
    if (idx === -1 || swapIdx < 0 || swapIdx >= siblings.length) return;
    // Reorder the array, then RE-SEQUENCE all siblings 0..n-1 (a pairwise value swap
    // is a no-op when siblings share position 0, as new items do by default).
    [siblings[idx], siblings[swapIdx]] = [siblings[swapIdx]!, siblings[idx]!];
    move.mutate(
      siblings.map((s, i) => ({ id: s.id, position: i, parent_id: s.parent_id })),
    );
  };

  const onDelete = async (item: NavRow) => {
    const childCount = (childrenByParent.get(item.id) ?? []).length;
    // navigation_menu.parent_id is ON DELETE CASCADE → nested items are deleted too.
    const message =
      childCount > 0
        ? `"${item.label}" and its ${childCount} nested item(s) will be permanently deleted. This can't be undone.`
        : `"${item.label}" will be permanently deleted. This can't be undone.`;
    if (await confirm({ title: "Delete nav item?", message, confirmLabel: "Delete", danger: true }))
      del.mutate(item.id);
  };

  const renderRow = (item: NavRow, siblings: NavRow[], depth: number) => {
    const idx = siblings.findIndex((s) => s.id === item.id);
    const children = childrenByParent.get(item.id) ?? [];
    return (
      <div key={item.id}>
        <div
          className={cn(
            "flex items-center gap-3 px-5 py-3 hover:bg-stone-50",
            !item.is_active && "opacity-50",
          )}
          style={{ paddingLeft: 20 + depth * 24 }}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate font-medium">{item.label}</span>
              <span className="rounded bg-stone-100 px-1.5 py-0.5 text-2xs font-medium uppercase tracking-wide text-stone-500">
                {LINK_TYPE_LABEL[item.link_type]}
              </span>
              {!item.is_active && (
                <span className="text-2xs uppercase tracking-wide text-stone-400">
                  Hidden
                </span>
              )}
            </div>
            {item.link_target && (
              <p className="truncate text-xs text-stone-400">{item.link_target}</p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={idx <= 0 || move.isPending}
              onClick={() => moveWithinSiblings(item, -1)}
              aria-label="Move up"
            >
              ↑
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={idx === siblings.length - 1 || move.isPending}
              onClick={() => moveWithinSiblings(item, 1)}
              aria-label="Move down"
            >
              ↓
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setForm(rowToForm(item))}>
              Edit
            </Button>
            <button
              type="button"
              onClick={() => onDelete(item)}
              className="px-2 text-xs text-danger hover:underline"
            >
              Delete
            </button>
          </div>
        </div>

        {children.map((child) => renderRow(child, children, depth + 1))}
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        title="Navigation"
        description="Build the storefront navbar. Nest items under a dropdown to create menus."
        actions={
          isEdit ? (
            <Button variant="ghost" onClick={() => setForm(BLANK)}>
              Cancel edit
            </Button>
          ) : undefined
        }
      />

      {error && <ErrorNote error={error} />}
      {save.error && <ErrorNote error={save.error} />}
      {del.error && <ErrorNote error={del.error} />}
      {move.error && <ErrorNote error={move.error} />}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* PHASE 2: drag-drop reordering. For now use the up/down buttons + parent select. */}
        <Card className="overflow-hidden p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <Spinner />
            </div>
          ) : !topLevel.length ? (
            <p className="p-8 text-center text-sm text-stone-500">No navigation items yet.</p>
          ) : (
            <div className="divide-y divide-stone-100">
              {topLevel.map((item) => renderRow(item, topLevel, 0))}
            </div>
          )}
        </Card>

        <Card title={isEdit ? "Edit item" : "New item"} className="h-fit">
          <div className="space-y-4">
            <Field label="Label" htmlFor="nav-label">
              <Input
                id="nav-label"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              />
            </Field>

            <Field label="Link type" htmlFor="nav-type">
              <Select
                id="nav-type"
                value={form.link_type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, link_type: e.target.value as NavLinkType }))
                }
              >
                {NAV_LINK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {LINK_TYPE_LABEL[t]}
                  </option>
                ))}
              </Select>
            </Field>

            {form.link_type !== "dropdown_parent" && (
              <Field label="Link target" htmlFor="nav-target" hint={TARGET_HINT[form.link_type]}>
                <Input
                  id="nav-target"
                  value={form.link_target}
                  onChange={(e) => setForm((f) => ({ ...f, link_target: e.target.value }))}
                />
              </Field>
            )}

            <Field
              label="Parent dropdown"
              htmlFor="nav-parent"
              hint="Nest this item under a dropdown, or leave at top level."
            >
              <Select
                id="nav-parent"
                value={form.parent_id}
                onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value }))}
              >
                <option value="">None (top level)</option>
                {dropdownParents
                  .filter((p) => p.id !== form.id) // can't parent itself
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
              </Select>
            </Field>

            <Field label="Position" htmlFor="nav-position" hint="Lower numbers appear first.">
              <Input
                id="nav-position"
                type="number"
                value={String(form.position)}
                onChange={(e) =>
                  setForm((f) => ({ ...f, position: Number(e.target.value) }))
                }
              />
            </Field>

            <Toggle
              checked={form.is_active}
              onChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
              label="Active"
            />

            <div className="flex justify-end gap-2 pt-2">
              {isEdit && (
                <Button variant="ghost" onClick={() => setForm(BLANK)}>
                  Cancel
                </Button>
              )}
              <Button
                onClick={onSave}
                disabled={save.isPending || !form.label.trim()}
              >
                {save.isPending ? "Saving…" : isEdit ? "Save changes" : "Add item"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
