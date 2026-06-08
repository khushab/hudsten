import { useState } from "react";
import type { EditorImage } from "@/api/products";
import { uploadProductImage } from "@/api/storage";
import { ErrorNote, Input, Select, Spinner } from "@/components/ui";

/**
 * Upload images to Storage and tag each to a Color option-value (the variant-image
 * engine). Untagged images become the product-level fallback set on the PDP.
 */
export function ImagesEditor({
  images,
  colorValues,
  onImages,
}: {
  images: EditorImage[];
  colorValues: { key: string; value: string }[];
  onImages: (next: EditorImage[]) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setError(null);
    setBusy(true);
    try {
      const uploaded: EditorImage[] = [];
      for (const file of files) {
        const url = await uploadProductImage(file);
        uploaded.push({
          url,
          alt_text: "",
          position: images.length + uploaded.length,
          colorKey: null,
        });
      }
      onImages([...images, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  const update = (i: number, patch: Partial<EditorImage>) =>
    onImages(images.map((img, idx) => (idx === i ? { ...img, ...patch } : img)));

  const remove = (i: number) =>
    onImages(images.filter((_, idx) => idx !== i).map((img, idx) => ({ ...img, position: idx })));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j]!, next[i]!];
    onImages(next.map((img, idx) => ({ ...img, position: idx })));
  };

  return (
    <div className="space-y-4">
      {error && <ErrorNote error={error} />}

      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-stone-300 bg-paper px-4 py-2 text-sm font-medium hover:border-ink">
        {busy ? <Spinner /> : "+ Upload images"}
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onPick}
          disabled={busy}
        />
      </label>

      {images.length === 0 ? (
        <p className="text-sm text-stone-500">
          No images yet. Upload, then tag each to a color (or leave untagged for the
          product-level fallback set).
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {images.map((img, i) => (
            <div key={img.url} className="flex gap-3 rounded-md border border-stone-200 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-24 w-20 shrink-0 rounded object-cover" />
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Alt text"
                  value={img.alt_text ?? ""}
                  onChange={(e) => update(i, { alt_text: e.target.value })}
                  className="h-8 text-xs"
                />
                <Select
                  value={img.colorKey ?? ""}
                  onChange={(e) => update(i, { colorKey: e.target.value || null })}
                  className="h-8 text-xs"
                >
                  <option value="">Product-level (all colors)</option>
                  {colorValues.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.value || "(unnamed color)"}
                    </option>
                  ))}
                </Select>
                <div className="flex items-center gap-2 text-xs">
                  <button type="button" onClick={() => move(i, -1)} className="hover:underline">
                    ↑
                  </button>
                  <button type="button" onClick={() => move(i, 1)} className="hover:underline">
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="text-danger hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
