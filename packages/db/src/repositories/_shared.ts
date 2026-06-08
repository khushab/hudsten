import { ROUTES } from "@hudsten/shared";
import type { PostgrestError } from "@supabase/supabase-js";
import type { Enums } from "../database.types";

/** Thrown by repositories so callers can render error states consistently. */
export class RepositoryError extends Error {
  constructor(
    message: string,
    public override readonly cause?: PostgrestError | null,
  ) {
    super(message);
    this.name = "RepositoryError";
  }
}

/** Unwrap a PostgREST single/list response, throwing on error. */
export function unwrap<T>(
  res: { data: T | null; error: PostgrestError | null },
  context: string,
): T {
  if (res.error) {
    throw new RepositoryError(`${context}: ${res.error.message}`, res.error);
  }
  // Lists default to [] from PostgREST; single() may legitimately return null.
  return res.data as T;
}

/** Resolve a navigation row to a relative href. Dropdown parents have no link. */
export function resolveNavHref(
  linkType: Enums<"nav_link_type">,
  target: string | null,
): string | null {
  if (!target && linkType !== "dropdown_parent") return null;
  switch (linkType) {
    case "category":
      return `${ROUTES.category}/${target}`;
    case "collection":
      return `${ROUTES.collection}/${target}`;
    case "url":
      return target;
    case "dropdown_parent":
      return null;
    default:
      return null;
  }
}

/** position-then-created_at sort used across nested arrays. */
export function byPosition<T extends { position: number }>(a: T, b: T): number {
  return a.position - b.position;
}
