import type {
  EditorOption,
  EditorOptionValue,
  EditorVariant,
} from "@/api/products";
import { Button, Input } from "@/components/ui";

const uid = () => crypto.randomUUID();
const isColor = (name: string) => name.toLowerCase() === "color";

function cartesian(options: EditorOption[]): EditorOptionValue[][] {
  if (options.length === 0 || options.some((o) => o.values.length === 0)) return [];
  return options.reduce<EditorOptionValue[][]>(
    (acc, opt) => acc.flatMap((combo) => opt.values.map((v) => [...combo, v])),
    [[]],
  );
}

/**
 * Live pricing-anchor warnings (non-blocking; save-time validation still rejects
 * hard violations). The storefront only shows a strikethrough when price and
 * compare-at come from the SAME level — these catch configs that silently lose
 * the discount display or invert the anchor.
 */
function pricingWarnings(
  variants: EditorVariant[],
  basePrice: number,
  baseCompareAt: number | null,
): string[] {
  const warnings: string[] = [];
  if (baseCompareAt != null && baseCompareAt !== 0 && baseCompareAt <= basePrice) {
    warnings.push(
      "Product compare-at is not above the price — no discount will show (and save will be rejected).",
    );
  }
  for (const v of variants) {
    if (v.price != null && v.compare_at_price == null && baseCompareAt != null) {
      warnings.push(
        `Variant "${v.title}" overrides the price without its own compare-at — the product's anchor won't apply, so this variant shows NO discount.`,
      );
    }
    const effectivePrice = v.price ?? basePrice;
    if (
      v.compare_at_price != null &&
      v.compare_at_price !== 0 &&
      v.compare_at_price <= effectivePrice
    ) {
      warnings.push(
        `Variant "${v.title}": compare-at (${v.compare_at_price}) must exceed its price (${effectivePrice}).`,
      );
    }
  }
  return warnings;
}

export function OptionsVariants({
  options,
  variants,
  basePrice,
  baseCompareAt,
  onOptions,
  onVariants,
}: {
  options: EditorOption[];
  variants: EditorVariant[];
  basePrice: number;
  baseCompareAt: number | null;
  onOptions: (next: EditorOption[]) => void;
  onVariants: (next: EditorVariant[]) => void;
}) {
  const addOption = () =>
    onOptions([...options, { name: "", position: options.length, values: [] }]);

  const updateOption = (i: number, patch: Partial<EditorOption>) =>
    onOptions(options.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));

  const removeOption = (i: number) =>
    onOptions(options.filter((_, idx) => idx !== i).map((o, idx) => ({ ...o, position: idx })));

  const addValue = (i: number) =>
    updateOption(i, {
      values: [
        ...options[i]!.values,
        { key: uid(), value: "", color_hex: null, position: options[i]!.values.length },
      ],
    });

  const updateValue = (i: number, vi: number, patch: Partial<EditorOptionValue>) =>
    updateOption(i, {
      values: options[i]!.values.map((v, idx) => (idx === vi ? { ...v, ...patch } : v)),
    });

  const removeValue = (i: number, vi: number) =>
    updateOption(i, {
      values: options[i]!.values
        .filter((_, idx) => idx !== vi)
        .map((v, idx) => ({ ...v, position: idx })),
    });

  // Regenerate variants from the option matrix, preserving edits for combos that still exist.
  const generate = () => {
    const combos = cartesian(options);
    const keyOf = (keys: string[]) => [...keys].sort().join("|");
    const existing = new Map(variants.map((v) => [keyOf(v.valueKeys), v]));
    const next: EditorVariant[] = combos.map((combo, i) => {
      const valueKeys = combo.map((v) => v.key);
      const prior = existing.get(keyOf(valueKeys));
      return {
        title: combo.map((v) => v.value).join(" / "),
        sku: prior?.sku ?? null,
        price: prior?.price ?? null,
        compare_at_price: prior?.compare_at_price ?? null,
        in_stock: prior?.in_stock ?? true,
        position: i,
        valueKeys,
      };
    });
    onVariants(next);
  };

  const updateVariant = (i: number, patch: Partial<EditorVariant>) =>
    onVariants(variants.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));

  return (
    <div className="space-y-6">
      {/* Options */}
      <div className="space-y-4">
        {options.map((opt, i) => (
          <div key={i} className="rounded-md border border-stone-200 p-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Option name (e.g. Color, Size)"
                value={opt.name}
                onChange={(e) => updateOption(i, { name: e.target.value })}
                className="max-w-xs"
              />
              <Button variant="ghost" size="sm" onClick={() => removeOption(i)}>
                Remove
              </Button>
            </div>
            <div className="mt-3 space-y-2">
              {opt.values.map((v, vi) => (
                <div key={v.key} className="flex items-center gap-2">
                  <Input
                    placeholder="Value"
                    value={v.value}
                    onChange={(e) => updateValue(i, vi, { value: e.target.value })}
                    className="max-w-[12rem]"
                  />
                  {isColor(opt.name) && (
                    <input
                      type="color"
                      aria-label="Swatch color"
                      value={v.color_hex ?? "#111111"}
                      onChange={(e) => updateValue(i, vi, { color_hex: e.target.value })}
                      className="h-9 w-12 cursor-pointer rounded border border-stone-300"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeValue(i, vi)}
                    className="text-xs text-danger hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <Button variant="secondary" size="sm" onClick={() => addValue(i)}>
                + Add value
              </Button>
            </div>
          </div>
        ))}
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={addOption}>
            + Add option
          </Button>
          {options.length > 0 && (
            <Button size="sm" onClick={generate}>
              Generate variants
            </Button>
          )}
        </div>
      </div>

      {/* Pricing-anchor warnings */}
      {variants.length > 0 &&
        (() => {
          const warnings = pricingWarnings(variants, basePrice, baseCompareAt);
          if (warnings.length === 0) return null;
          return (
            <ul
              role="alert"
              className="space-y-1 rounded-md border border-brass-300 bg-brass-50 p-3 text-xs text-brass-800"
            >
              {warnings.map((w) => (
                <li key={w}>⚠ {w}</li>
              ))}
            </ul>
          );
        })()}

      {/* Variants */}
      {variants.length > 0 && (
        <div className="overflow-x-auto rounded-md border border-stone-200">
          <table className="w-full text-sm">
            <thead className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-400">
              <tr>
                <th className="px-3 py-2 font-medium">Variant</th>
                <th className="px-3 py-2 font-medium">SKU</th>
                <th className="px-3 py-2 font-medium">Price</th>
                <th className="px-3 py-2 font-medium">Compare-at</th>
                <th className="px-3 py-2 font-medium">In stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {variants.map((v, i) => (
                <tr key={v.valueKeys.join("|") || i}>
                  <td className="px-3 py-2 font-medium">{v.title}</td>
                  <td className="px-3 py-2">
                    <Input
                      value={v.sku ?? ""}
                      onChange={(e) => updateVariant(i, { sku: e.target.value || null })}
                      className="h-8 text-xs"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      placeholder="(base)"
                      value={v.price == null ? "" : String(v.price)}
                      onChange={(e) =>
                        updateVariant(i, { price: e.target.value === "" ? null : Number(e.target.value) })
                      }
                      className="h-8 w-24 text-xs"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      placeholder="—"
                      value={v.compare_at_price == null ? "" : String(v.compare_at_price)}
                      onChange={(e) =>
                        updateVariant(i, {
                          compare_at_price: e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                      className="h-8 w-24 text-xs"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={v.in_stock}
                      onChange={(e) => updateVariant(i, { in_stock: e.target.checked })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
