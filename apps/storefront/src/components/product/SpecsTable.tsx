import {
  formatSpecValue,
  groupSpecFields,
  type SpecSchema,
  type SpecValue,
} from "@hudsten/shared";

/**
 * Specs rendered DYNAMICALLY from the product type's spec_schema (PRD §6). Adding a new
 * product type with different fields renders here automatically — no code change.
 * `whats_in_box` is excluded (it has its own section).
 */
export function SpecsTable({
  schema,
  specs,
}: {
  schema: SpecSchema;
  specs: Record<string, unknown>;
}) {
  const groups = groupSpecFields(schema.filter((f) => f.key !== "whats_in_box"));

  // Only show fields that actually have a value.
  const hasAny = schema.some(
    (f) => f.key !== "whats_in_box" && specs[f.key] != null && specs[f.key] !== "",
  );
  if (!hasAny) return null;

  return (
    <div className="space-y-8">
      {groups.map(({ group, fields }) => {
        const rows = fields.filter(
          (f) => specs[f.key] != null && specs[f.key] !== "",
        );
        if (rows.length === 0) return null;
        return (
          <div key={group ?? "_"}>
            {group && (
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-eyebrow text-stone-500">
                {group}
              </h3>
            )}
            <dl className="divide-y divide-stone-200 border-t border-stone-200">
              {rows.map((f) => (
                <div key={f.key} className="grid grid-cols-3 gap-4 py-3 text-sm">
                  <dt className="text-stone-500">{f.label}</dt>
                  <dd className="col-span-2 text-ink">
                    {formatSpecValue(f, specs[f.key] as SpecValue)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        );
      })}
    </div>
  );
}
