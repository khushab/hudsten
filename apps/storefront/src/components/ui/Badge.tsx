import { cn } from "@/lib/cn";

type Tone = "ink" | "brass" | "danger" | "neutral";

const tones: Record<Tone, string> = {
  ink: "bg-ink text-paper",
  brass: "bg-brass text-ink",
  danger: "bg-danger text-white",
  neutral: "border border-stone-300 text-stone-600",
};

// Map known product badge labels to a tone; unknown labels fall back to neutral.
const badgeTone: Record<string, Tone> = {
  New: "neutral",
  Bestseller: "ink",
  Limited: "ink",
  Handcrafted: "neutral",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-2xs font-medium uppercase tracking-eyebrow",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Render a product's badge labels with their mapped tones. */
export function ProductBadges({
  badges,
  className,
}: {
  badges: string[];
  className?: string;
}) {
  if (!badges?.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {badges.map((b) => (
        <Badge key={b} tone={badgeTone[b] ?? "neutral"}>
          {b}
        </Badge>
      ))}
    </div>
  );
}
