import { groupSpecFields, type SpecField, type SpecSchema } from "@hudsten/shared";
import { Field, Input, Select, Textarea, Toggle } from "@/components/ui";

/**
 * Renders a spec form DYNAMICALLY from the selected product type's spec_schema.
 * Whatever fields the type defines appear here — the no-migration expansion mechanism.
 */
export function SpecsForm({
  schema,
  value,
  onChange,
}: {
  schema: SpecSchema;
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
}) {
  if (!schema.length) {
    return (
      <p className="text-sm text-stone-500">
        This product type has no spec fields. Add them in Product Types.
      </p>
    );
  }
  const set = (key: string, v: unknown) => onChange({ ...value, [key]: v });
  const groups = groupSpecFields(schema);

  return (
    <div className="space-y-6">
      {groups.map(({ group, fields }) => (
        <div key={group ?? "_"} className="space-y-4">
          {group && (
            <p className="text-2xs font-semibold uppercase tracking-eyebrow text-stone-400">
              {group}
            </p>
          )}
          {fields.map((f) => (
            <SpecFieldInput key={f.key} field={f} value={value[f.key]} onChange={(v) => set(f.key, v)} />
          ))}
        </div>
      ))}
    </div>
  );
}

function SpecFieldInput({
  field,
  value,
  onChange,
}: {
  field: SpecField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const label = field.unit ? `${field.label} (${field.unit})` : field.label;
  const id = `spec-${field.key}`;

  switch (field.type) {
    case "textarea":
      return (
        <Field label={label} htmlFor={id} hint={field.help}>
          <Textarea
            id={id}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );
    case "number":
      return (
        <Field label={label} htmlFor={id} hint={field.help}>
          <Input
            id={id}
            type="number"
            step="any"
            value={value == null ? "" : String(value)}
            onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          />
        </Field>
      );
    case "boolean":
      return (
        <Field label={label} hint={field.help}>
          <Toggle checked={Boolean(value)} onChange={onChange} />
        </Field>
      );
    case "select":
      return (
        <Field label={label} htmlFor={id} hint={field.help}>
          <Select id={id} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}>
            <option value="">—</option>
            {(field.options ?? []).map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </Select>
        </Field>
      );
    case "list":
      return (
        <Field label={label} htmlFor={id} hint={field.help ?? "One item per line"}>
          <Textarea
            id={id}
            value={Array.isArray(value) ? (value as string[]).join("\n") : ""}
            onChange={(e) =>
              onChange(
                e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
          />
        </Field>
      );
    default:
      return (
        <Field label={label} htmlFor={id} hint={field.help}>
          <Input
            id={id}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );
  }
}
