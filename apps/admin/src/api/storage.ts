import { PRODUCT_IMAGE_BUCKET } from "@hudsten/shared";
import { getSupabase } from "@/lib/supabase";

/**
 * Upload a product image to Supabase Storage and return its public URL.
 * RLS on storage.objects restricts writes to admins (migration 05). The bucket is
 * public-read, served via CDN + next/image on the storefront.
 */
export async function uploadProductImage(file: File): Promise<string> {
  const sb = getSupabase();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });
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
