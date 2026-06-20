import { useState } from "react";
import { uploadProductImage } from "@/api/storage";
import { ErrorNote, Spinner } from "@/components/ui";

/**
 * Single-image upload control: shows a preview with Replace/Remove, or an empty
 * dropzone. Uploads via uploadProductImage, so it inherits the same client-side
 * compression + WebP conversion + HEIC rejection as product images. Reports the
 * public URL back via onChange (null when the image is removed).
 */
export function ImageUploadField({
  value,
  onChange,
  alt = "",
  fit = "cover",
}: {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  alt?: string;
  // "contain" keeps a logo fully visible (never cropped); "cover" suits photos.
  fit?: "cover" | "contain";
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const url = await uploadProductImage(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      {error && <ErrorNote error={error} />}
      {value ? (
        <div className="flex items-start gap-3">
          <img
            src={value}
            alt={alt}
            className={`h-28 w-44 shrink-0 rounded-md border border-stone-200 ${
              fit === "contain" ? "bg-paper-dim object-contain p-2" : "object-cover"
            }`}
          />
          <div className="flex items-center gap-3 text-xs">
            <label className="cursor-pointer hover:underline">
              {busy ? <Spinner /> : "Replace"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPick}
                disabled={busy}
              />
            </label>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-danger hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label className="inline-flex h-28 w-44 cursor-pointer items-center justify-center rounded-md border border-dashed border-stone-300 text-xs text-stone-500 hover:border-ink">
          {busy ? <Spinner /> : "+ Upload image"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPick}
            disabled={busy}
          />
        </label>
      )}
    </div>
  );
}
