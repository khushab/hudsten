import type { SpecFieldType } from "./constants";

/**
 * A single field definition inside product_types.spec_schema (PRD §4, §6).
 * This is the expansion mechanism: adding a new product_type with its own fields
 * lets us sell T-shirts/wallets/jackets with ZERO schema migration — the admin form
 * and PDP spec table both render from this array.
 */
export interface SpecField {
  /** Stable key used in products.specs JSONB, e.g. "capacity_l". */
  key: string;
  /** Human label shown in admin + PDP, e.g. "Capacity". */
  label: string;
  type: SpecFieldType;
  /** Display unit appended on the PDP, e.g. "L", "kg", "cm". */
  unit?: string;
  /** Optional grouping for the PDP spec table, e.g. "Dimensions", "Materials". */
  group?: string;
  /** For type === "select": allowed values. */
  options?: string[];
  /** Optional helper text in the admin form. */
  help?: string;
}

export type SpecSchema = SpecField[];

/** The value stored in products.specs for each key. */
export type SpecValue = string | number | boolean | string[] | null;
export type SpecValues = Record<string, SpecValue>;

/**
 * Group spec fields by their `group` (preserving definition order) for the PDP spec table.
 * Ungrouped fields fall under a single bucket the UI can render without a heading.
 */
export function groupSpecFields(
  schema: SpecSchema,
): { group: string | null; fields: SpecField[] }[] {
  const order: (string | null)[] = [];
  const buckets = new Map<string | null, SpecField[]>();
  for (const field of schema) {
    const g = field.group ?? null;
    if (!buckets.has(g)) {
      buckets.set(g, []);
      order.push(g);
    }
    buckets.get(g)!.push(field);
  }
  return order.map((group) => ({ group, fields: buckets.get(group)! }));
}

/** Format a stored spec value for display, appending the unit when present. */
export function formatSpecValue(field: SpecField, value: SpecValue): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return field.unit ? `${value} ${field.unit}` : String(value);
}
