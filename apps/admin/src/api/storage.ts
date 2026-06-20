import imageCompression from "browser-image-compression";
import { PRODUCT_IMAGE_BUCKET } from "@hudsten/shared";
import { getSupabase } from "@/lib/supabase";

// Tuned for zoomable gallery product photos: 2048px longest edge keeps pinch-zoom
// crisp while killing 4000px+ phone originals; ~0.82 WebP is visually lossless for
// photography. maxSizeMB is the ceiling the encoder iterates down to.
const COMPRESS_OPTS = {
  maxWidthOrHeight: 2048,
  maxSizeMB: 1.2,
  initialQuality: 0.82,
  fileType: "image/webp" as const,
  useWebWorker: true,
};

// Skip compression entirely — re-encoding either destroys the file or wastes work.
const SKIP_COMPRESSION = new Set([
  "image/svg+xml", // vector — rasterizing it destroys it (and is an XSS vector)
  "image/gif", // canvas compression flattens animation to a single frame
  "image/webp", // already in our target format
]);

/** HEIC/HEIF can't be decoded outside Safari, so we reject it with a clear message. */
async function isHeic(file: File): Promise<boolean> {
  if (/\.(heic|heif)$/i.test(file.name)) return true;
  if (/^image\/heic|^image\/heif/i.test(file.type)) return true;
  // iOS sometimes reports an empty MIME type — check the ISO-BMFF brand in the ftyp box.
  try {
    const brand = new TextDecoder().decode(await file.slice(8, 12).arrayBuffer());
    return ["heic", "heix", "heif", "mif1", "msf1"].includes(brand.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Compress + convert to WebP before upload. Shrinks source bytes (faster admin
 * uploads on weak connections, lower storage + Vercel optimization cost). Returns
 * the original file untouched for formats we must not re-encode, or if compression
 * fails — so an upload never breaks over compression. Throws only for HEIC.
 */
async function compressImage(file: File): Promise<File> {
  if (await isHeic(file)) {
    throw new Error("HEIC images aren't supported — please upload a JPG, PNG, or WebP.");
  }
  // Already small (<300KB) or a format we leave alone: upload as-is.
  if (SKIP_COMPRESSION.has(file.type) || file.size < 300_000) return file;

  try {
    // WebP preserves PNG alpha as long as the canvas stays transparent (no bg fill),
    // which browser-image-compression does by default — so cutouts/logos keep alpha.
    const out = await imageCompression(file, COMPRESS_OPTS);
    // Never ship a "compressed" file that ended up larger than the original.
    return out.size < file.size ? out : file;
  } catch {
    // Decode failure (corrupt/exotic format) — fall back to the original.
    return file;
  }
}

/**
 * Upload a product image to Supabase Storage and return its public URL.
 * RLS on storage.objects restricts writes to admins (migration 05). The bucket is
 * public-read, served via CDN + next/image on the storefront.
 */
export async function uploadProductImage(file: File): Promise<string> {
  const sb = getSupabase();
  const out = await compressImage(file);
  // Derive ext + contentType from the OUTPUT (WebP after compression), not the
  // original name — otherwise Storage serves the new bytes under a stale MIME.
  const ext = out.type === "image/webp" ? "webp" : out.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(path, out, { cacheControl: "3600", upsert: false, contentType: out.type });
  if (error) throw new Error(`uploadProductImage: ${error.message}`);
  const { data } = sb.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Public URL → storage path, only for files in OUR bucket (external URLs → null). */
function storagePathFromUrl(url: string): string | null {
  const marker = `/object/public/${PRODUCT_IMAGE_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const path = url.slice(idx + marker.length).split("?")[0];
  return path ? decodeURIComponent(path) : null;
}

/**
 * Best-effort cleanup of storage files no longer referenced by a product.
 * Failures are logged, not thrown — an orphaned file is recoverable; failing a
 * successful product save over cleanup is not worth it.
 */
export async function removeProductImages(urls: string[]): Promise<void> {
  const paths = urls
    .map(storagePathFromUrl)
    .filter((p): p is string => p !== null);
  if (paths.length === 0) return;
  const { error } = await getSupabase()
    .storage.from(PRODUCT_IMAGE_BUCKET)
    .remove(paths);
  if (error) console.error(`removeProductImages: ${error.message}`);
}
