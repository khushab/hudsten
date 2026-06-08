export function must<T>(
  res: { data: T; error: { message: string } | null },
  ctx: string,
): T {
  if (res.error) throw new Error(`${ctx}: ${res.error.message}`);
  return res.data;
}

/** slugify mirror (kept local to avoid a runtime import cycle). */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
