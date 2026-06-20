import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { slugify } from "@hudsten/shared";
import {
  deleteCategory,
  listCategories,
  reorderCategories,
  upsertCategory,
  type Category,
  type CategoryInput,
} from "@/api/categories";
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
  Textarea,
  Toggle,
} from "@/components/ui";
import { cn } from "@/lib/cn";

// ── Form state ──────────────────────────────────────────────────────────────
type FormState = {
  id?: string;
  name: string;
  slug: string;
  parent_id: string | null;
  description: string;
  image_url: string;
  position: number;
  is_active: boolean;
  meta_title: string;
  meta_description: string;
};

const BLANK: FormState = {
  name: "",
  slug: "",
  parent_id: null,
  description: "",
  image_url: "",
  position: 0,
  is_active: true,
  meta_title: "",
  meta_description: "",
};

function toForm(c: Category): FormState {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    parent_id: c.parent_id,
    description: c.description ?? "",
    image_url: c.image_url ?? "",
    position: c.position,
    is_active: c.is_active,
    meta_title: c.meta_title ?? "",
    meta_description: c.meta_description ?? "",
  };
}

// Empty strings → null so we don't persist blanks into nullable columns.
function toInput(f: FormState): CategoryInput {
  const base = {
    name: f.name.trim(),
    slug: f.slug.trim(),
    parent_id: f.parent_id,
    description: f.description.trim() || null,
    image_url: f.image_url.trim() || null,
    position: f.position,
    is_active: f.is_active,
    meta_title: f.meta_title.trim() || null,
    meta_description: f.meta_description.trim() || null,
  };
  return f.id ? { ...base, id: f.id } : base;
}

// ── Tree node ─────────────────────────────────────────────────────────────────
type TreeNode = Category & { children: TreeNode[] };

export default function Categories() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  });

  const [form, setForm] = useState<FormState>(BLANK);
  const [slugTouched, setSlugTouched] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const cats = useMemo(() => data ?? [], [data]);

  // Build parent→children tree, sorting each sibling level by position.
  const roots = useMemo<TreeNode[]>(() => {
    const byId = new Map<string, TreeNode>();
    for (const c of cats) byId.set(c.id, { ...c, children: [] });
    const top: TreeNode[] = [];
    for (const node of byId.values()) {
      const parent = node.parent_id ? byId.get(node.parent_id) : undefined;
      if (parent) parent.children.push(node);
      else top.push(node); // null parent OR dangling parent_id → treat as root
    }
    const sortRec = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => a.position - b.position);
      for (const n of nodes) sortRec(n.children);
    };
    sortRec(top);
    return top;
  }, [cats]);

  // Descendant set of the category being edited — invalid parent choices (would
  // create a cycle). Includes the node itself.
  const blockedParentIds = useMemo<Set<string>>(() => {
    const blocked = new Set<string>();
    if (!form.id) return blocked;
    const childrenOf = new Map<string, string[]>();
    for (const c of cats) {
      if (!c.parent_id) continue;
      const arr = childrenOf.get(c.parent_id) ?? [];
      arr.push(c.id);
      childrenOf.set(c.parent_id, arr);
    }
    const stack = [form.id];
    while (stack.length) {
      const cur = stack.pop()!;
      if (blocked.has(cur)) continue;
      blocked.add(cur);
      for (const child of childrenOf.get(cur) ?? []) stack.push(child);
    }
    return blocked;
  }, [cats, form.id]);

  const resetForm = () => {
    setForm(BLANK);
    setSlugTouched(false);
    setFormError(null);
  };

  const startEdit = (c: Category) => {
    setForm(toForm(c));
    setSlugTouched(true); // never clobber an existing slug while editing
    setFormError(null);
  };

  const save = useMutation({
    mutationFn: (f: FormState) => upsertCategory(toInput(f)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      resetForm();
    },
    onError: (e) => setFormError(e instanceof Error ? e.message : "Save failed"),
  });

  const del = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
  const confirm = useConfirm();

  const reorder = useMutation({
    mutationFn: reorderCategories,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });

  // Swap a node's position with the adjacent sibling, then persist both rows.
  const move = (node: TreeNode, dir: -1 | 1) => {
    const siblings = node.parent_id
      ? (roots.length ? findChildren(roots, node.parent_id) : [])
      : roots;
    const ordered = [...siblings];
    const idx = ordered.findIndex((s) => s.id === node.id);
    const swapIdx = idx + dir;
    if (idx === -1 || swapIdx < 0 || swapIdx >= ordered.length) return;
    // Reorder then RE-SEQUENCE 0..n-1 (pairwise value swap is a no-op when siblings
    // share position 0, which newly-created categories do by default).
    [ordered[idx], ordered[swapIdx]] = [ordered[swapIdx]!, ordered[idx]!];
    reorder.mutate(
      ordered.map((s, i) => ({ id: s.id, position: i, parent_id: s.parent_id })),
    );
  };

  const onName = (name: string) =>
    setForm((f) => ({ ...f, name, ...(slugTouched ? {} : { slug: slugify(name) }) }));

  const onSubmit = () => {
    setFormError(null);
    if (!form.name.trim()) return setFormError("Name is required.");
    if (!form.slug.trim()) return setFormError("Slug is required.");
    save.mutate(form);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Organize your catalog into a nested, ordered tree."
        actions={
          form.id ? (
            <Button variant="secondary" onClick={resetForm}>
              + New category
            </Button>
          ) : undefined
        }
      />

      {error && <ErrorNote error={error} />}

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(320px,420px)]">
        {/* Tree */}
        <Card title="Category tree" className="overflow-hidden p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <Spinner />
            </div>
          ) : roots.length === 0 ? (
            <p className="p-8 text-center text-sm text-stone-500">No categories yet.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {/* PHASE 2: drag-drop — current lean reorder is up/down + parent select */}
              {roots.map((node, i) => (
                <CategoryRow
                  key={node.id}
                  node={node}
                  depth={0}
                  isFirst={i === 0}
                  isLast={i === roots.length - 1}
                  activeId={form.id}
                  busy={reorder.isPending || del.isPending}
                  onEdit={startEdit}
                  onDelete={async (c) => {
                    if (
                      await confirm({
                        title: "Delete category?",
                        message: `"${c.name}" will be permanently deleted.${c.children.length ? " Its sub-categories will be orphaned." : ""} This can't be undone.`,
                        confirmLabel: "Delete",
                        danger: true,
                      })
                    )
                      del.mutate(c.id);
                  }}
                  onMove={move}
                />
              ))}
            </ul>
          )}
        </Card>

        {/* Editor */}
        <Card title={form.id ? "Edit category" : "New category"}>
          <div className="space-y-4">
            {formError && <ErrorNote error={formError} />}

            <Field label="Name" htmlFor="cat-name">
              <Input id="cat-name" value={form.name} onChange={(e) => onName(e.target.value)} />
            </Field>

            <Field label="Slug" htmlFor="cat-slug" hint="URL: /c/<slug>">
              <Input
                id="cat-slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm((f) => ({ ...f, slug: e.target.value }));
                }}
              />
            </Field>

            <Field label="Parent category" htmlFor="cat-parent">
              <Select
                id="cat-parent"
                value={form.parent_id ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, parent_id: e.target.value || null }))
                }
              >
                <option value="">None (top level)</option>
                {cats
                  .filter((c) => !blockedParentIds.has(c.id))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </Select>
            </Field>

            <Field label="Description" htmlFor="cat-desc">
              <Textarea
                id="cat-desc"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </Field>

            <Field label="Image URL" htmlFor="cat-img">
              <Input
                id="cat-img"
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
              />
            </Field>

            <Field label="Position" htmlFor="cat-pos" hint="Lower numbers sort first among siblings.">
              <Input
                id="cat-pos"
                type="number"
                value={String(form.position)}
                onChange={(e) =>
                  setForm((f) => ({ ...f, position: Number(e.target.value) || 0 }))
                }
              />
            </Field>

            <Toggle
              checked={form.is_active}
              onChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
              label="Active"
            />

            <div className="border-t border-stone-100 pt-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-stone-400">
                SEO
              </p>
              <div className="space-y-4">
                <Field label="Meta title" htmlFor="cat-mt">
                  <Input
                    id="cat-mt"
                    value={form.meta_title}
                    onChange={(e) => setForm((f) => ({ ...f, meta_title: e.target.value }))}
                  />
                </Field>
                <Field label="Meta description" htmlFor="cat-md">
                  <Textarea
                    id="cat-md"
                    value={form.meta_description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, meta_description: e.target.value }))
                    }
                  />
                </Field>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              {form.id && (
                <Button variant="ghost" onClick={resetForm}>
                  Cancel
                </Button>
              )}
              <Button onClick={onSubmit} disabled={save.isPending}>
                {save.isPending ? "Saving…" : form.id ? "Save changes" : "Create category"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Find the sorted children array of a parent within the prebuilt tree.
function findChildren(nodes: TreeNode[], parentId: string): TreeNode[] {
  for (const n of nodes) {
    if (n.id === parentId) return n.children;
    const found = findChildren(n.children, parentId);
    if (found.length) return found;
  }
  return [];
}

// ── Row (recursive) ─────────────────────────────────────────────────────────
function CategoryRow({
  node,
  depth,
  isFirst,
  isLast,
  activeId,
  busy,
  onEdit,
  onDelete,
  onMove,
}: {
  node: TreeNode;
  depth: number;
  isFirst: boolean;
  isLast: boolean;
  activeId: string | undefined;
  busy: boolean;
  onEdit: (c: Category) => void;
  onDelete: (c: TreeNode) => void;
  onMove: (node: TreeNode, dir: -1 | 1) => void;
}) {
  return (
    <li>
      <div
        className={cn(
          "flex items-center justify-between gap-3 px-5 py-2.5 hover:bg-stone-50",
          activeId === node.id && "bg-brass-100/40",
        )}
      >
        <div
          className="flex min-w-0 items-center gap-2"
          style={{ paddingLeft: `${depth * 20}px` }}
        >
          {depth > 0 && <span className="text-stone-300">└</span>}
          <span className="truncate font-medium">{node.name}</span>
          <span className="truncate text-xs text-stone-400">/{node.slug}</span>
          {!node.is_active && (
            <span className="rounded bg-stone-200 px-1.5 py-0.5 text-2xs font-medium uppercase tracking-wide text-stone-600">
              Hidden
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            disabled={isFirst || busy}
            onClick={() => onMove(node, -1)}
            aria-label="Move up"
            className="rounded px-1.5 py-1 text-stone-500 hover:bg-stone-200 disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            disabled={isLast || busy}
            onClick={() => onMove(node, 1)}
            aria-label="Move down"
            className="rounded px-1.5 py-1 text-stone-500 hover:bg-stone-200 disabled:opacity-30"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => onEdit(node)}
            className="rounded px-2 py-1 text-xs text-ink hover:bg-stone-200"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(node)}
            className="rounded px-2 py-1 text-xs text-danger hover:underline"
          >
            Delete
          </button>
        </div>
      </div>

      {node.children.length > 0 && (
        <ul>
          {node.children.map((child, i) => (
            <CategoryRow
              key={child.id}
              node={child}
              depth={depth + 1}
              isFirst={i === 0}
              isLast={i === node.children.length - 1}
              activeId={activeId}
              busy={busy}
              onEdit={onEdit}
              onDelete={onDelete}
              onMove={onMove}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
