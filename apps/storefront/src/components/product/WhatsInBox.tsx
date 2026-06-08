import { CheckIcon } from "@/components/icons";

export function WhatsInBox({ items }: { items: unknown }) {
  const list = Array.isArray(items)
    ? (items.filter((i) => typeof i === "string" && i.trim()) as string[])
    : [];
  if (list.length === 0) return null;

  return (
    <ul className="space-y-2.5">
      {list.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm text-stone-700">
          <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brass-600" />
          {item}
        </li>
      ))}
    </ul>
  );
}
