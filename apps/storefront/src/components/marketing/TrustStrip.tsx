import { ReturnIcon, TruckIcon, LockIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

const ITEMS = [
  { Icon: TruckIcon, title: "Free shipping", sub: "All orders, pan-India" },
  { Icon: ReturnIcon, title: "7-day returns", sub: "Easy, no-fuss returns" },
  // Warranty paused. To restore: uncomment, add `ShieldIcon` to the import above,
  // and change `lg:grid-cols-3` → `lg:grid-cols-4` in TrustStrip below.
  // { Icon: ShieldIcon, title: "6-month warranty", sub: "Against manufacturing defects" },
  { Icon: LockIcon, title: "Secure ordering", sub: "Safe, protected checkout" },
];

/** Risk-reversal band (PRD §6 psychology). Reused on home; PDP has a compact variant. */
export function TrustStrip({ className }: { className?: string }) {
  return (
    <div className={cn("border-y border-stone-200 bg-paper-dim", className)}>
      <div className="mx-auto grid max-w-shell grid-cols-2 gap-x-6 gap-y-8 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        {ITEMS.map(({ Icon, title, sub }) => (
          <div key={title} className="flex items-start gap-3">
            <Icon className="h-7 w-7 shrink-0 text-ink" />
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs text-stone-500">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * One-line trust bar directly under the hero: an unknown brand must offer risk
 * reversal BEFORE the shopper evaluates products, not after (trust precedes price).
 */
export function TrustStripSlim({ className }: { className?: string }) {
  return (
    <div className={cn("border-y border-stone-200 bg-paper-dim", className)}>
      {/* 2×2 grid on mobile (all four guarantees visible — no cut-off scroller);
          one roomier centered line on larger screens. */}
      <ul className="mx-auto grid max-w-shell grid-cols-[auto_auto] justify-center gap-x-6 gap-y-2.5 px-4 py-3.5 sm:flex sm:items-center sm:justify-center sm:gap-x-10 sm:px-6 sm:py-4 lg:px-8">
        {ITEMS.map(({ Icon, title }) => (
          <li
            key={title}
            className="flex items-center gap-2 text-xs font-medium text-stone-600 sm:text-sm"
          >
            <Icon className="h-4 w-4 shrink-0 text-ink sm:h-5 sm:w-5" />
            {title}
          </li>
        ))}
      </ul>
    </div>
  );
}
