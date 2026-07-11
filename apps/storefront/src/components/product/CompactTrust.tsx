import { ReturnIcon, TruckIcon, LockIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

const ITEMS = [
  { Icon: TruckIcon, label: "Free shipping" },
  { Icon: ReturnIcon, label: "7-day returns" },
  // Warranty paused. To restore: uncomment, add `ShieldIcon` to the import above,
  // and change `sm:grid-cols-3` → `sm:grid-cols-4` in the <ul> below.
  // { Icon: ShieldIcon, label: "6-mo warranty" },
  { Icon: LockIcon, label: "Secure order" },
];

/** Compact risk-reversal row placed near the PDP CTA (PRD §6). */
export function CompactTrust({ className }: { className?: string }) {
  return (
    <ul
      className={cn(
        "grid grid-cols-[auto_auto] justify-center gap-x-6 gap-y-3 rounded-lg border border-stone-200 bg-paper-dim p-4 sm:grid-cols-3 sm:justify-items-start sm:gap-x-3",
        className,
      )}
    >
      {ITEMS.map(({ Icon, label }) => (
        <li key={label} className="flex items-center gap-2 text-xs font-medium text-stone-600">
          <Icon className="h-5 w-5 shrink-0 text-ink" />
          {label}
        </li>
      ))}
    </ul>
  );
}
