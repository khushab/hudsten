import { useState } from "react";
import { uploadProductImage } from "@/api/storage";
import { Button, ErrorNote, Input, Spinner, Textarea } from "@/components/ui";

type EditorialBlock = { image_url: string | null; heading: string; body: string };

/**
 * Long-form image+copy blocks for the PDP (e.g. lifestyle storytelling sections).
 * Each block carries one optional image (uploaded to the same product bucket),
 * a heading and a body.
 */
export function EditorialBlocksEditor({
  blocks,
  onChange,
}: {
  blocks: EditorialBlock[];
  onChange: (next: EditorialBlock[]) => void;
}) {
  // Per-row upload state so one block uploading doesn't disable the others.
  const [busyIdx, setBusyIdx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const update = (i: number, patch: Partial<EditorialBlock>) =>
    onChange(blocks.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));

  const remove = (i: number) => onChange(blocks.filter((_, idx) => idx !== i));

  async function onPick(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setBusyIdx(i);
    try {
      const url = await uploadProductImage(file);
      update(i, { image_url: url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusyIdx(null);
    }
  }

  if (blocks.length === 0) {
    return <p className="text-sm text-stone-500">No editorial blocks yet.</p>;
  }

  return (
    <div className="space-y-4">
      {error && <ErrorNote error={error} />}

      {blocks.map((b, i) => (
        <div key={i} className="space-y-3 rounded-md border border-stone-200 p-3">
          <div className="flex items-start gap-3">
            {b.image_url ? (
              <div className="space-y-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.image_url}
                  alt=""
                  className="h-24 w-32 shrink-0 rounded object-cover"
                />
                <div className="flex items-center gap-3 text-xs">
                  <label className="cursor-pointer hover:underline">
                    {busyIdx === i ? <Spinner /> : "Replace"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onPick(i, e)}
                      disabled={busyIdx === i}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => update(i, { image_url: null })}
                    className="text-danger hover:underline"
                  >
                    Remove image
                  </button>
                </div>
              </div>
            ) : (
              <label className="inline-flex h-24 w-32 shrink-0 cursor-pointer items-center justify-center rounded-md border border-dashed border-stone-300 text-xs text-stone-500 hover:border-ink">
                {busyIdx === i ? <Spinner /> : "+ Image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onPick(i, e)}
                  disabled={busyIdx === i}
                />
              </label>
            )}

            <div className="flex-1 space-y-2">
              <Input
                placeholder="Heading"
                value={b.heading}
                onChange={(e) => update(i, { heading: e.target.value })}
              />
              <Textarea
                placeholder="Body"
                value={b.body}
                onChange={(e) => update(i, { body: e.target.value })}
              />
            </div>
          </div>

          <div className="text-right">
            <Button size="sm" variant="ghost" onClick={() => remove(i)}>
              Remove block
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
