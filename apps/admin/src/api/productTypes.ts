import type { SpecSchema } from "@hudsten/shared";
import type { Json, Tables } from "@hudsten/db";
import { getSupabase } from "@/lib/supabase";
import { must } from "./_util";

export type ProductTypeRow = Tables<"product_types">;

export interface ProductTypeInput {
  id?: string;
  name: string;
  spec_schema: SpecSchema;
}

export async function listProductTypes(): Promise<ProductTypeRow[]> {
  const sb = getSupabase();
  return (must(
    await sb.from("product_types").select("*").order("name", { ascending: true }),
    "listProductTypes",
  ) ?? []) as ProductTypeRow[];
}

export async function upsertProductType(input: ProductTypeInput): Promise<string> {
  const sb = getSupabase();
  const row = must(
    await sb
      .from("product_types")
      .upsert({
        ...(input.id ? { id: input.id } : {}),
        name: input.name,
        spec_schema: input.spec_schema as unknown as Json,
      })
      .select("id")
      .single(),
    "upsertProductType",
  ) as { id: string };
  return row.id;
}

export async function deleteProductType(id: string): Promise<void> {
  const sb = getSupabase();
  // FK is ON DELETE RESTRICT — surfaces a clear error if products still use this type.
  must(await sb.from("product_types").delete().eq("id", id).select("id"), "deleteProductType");
}
