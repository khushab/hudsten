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
