import { ReturnIcon, ShieldIcon, TruckIcon, LockIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

const ITEMS = [
  { Icon: TruckIcon, title: "Free shipping", sub: "On all orders, pan-India" },
  { Icon: ReturnIcon, title: "7-day returns", sub: "Easy, no-fuss returns" },
  { Icon: ShieldIcon, title: "1-year warranty", sub: "Against manufacturing defects" },
  { Icon: LockIcon, title: "Secure ordering", sub: "Order safely over WhatsApp" },
];

/** Risk-reversal band (PRD §6 psychology). Reused on home; PDP has a compact variant. */
export function TrustStrip({ className }: { className?: string }) {
  return (
    <div className={cn("border-y border-stone-200 bg-paper-dim", className)}>
      <div className="mx-auto grid max-w-shell grid-cols-2 gap-x-6 gap-y-8 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
        {ITEMS.map(({ Icon, title, sub }) => (
          <div key={title} className="flex items-start gap-3">
            <Icon className="h-7 w-7 shrink-0 text-brass-600" />
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-stone-500">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
