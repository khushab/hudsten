import { cn } from "@/lib/cn";

type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "brass"
  | "whatsapp"
  | "ghost"
  | "invert";
type Size = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 font-medium uppercase tracking-[0.18em] transition-colors duration-300 ease-lux disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-stone-700",
  secondary: "border border-ink text-ink hover:bg-ink hover:text-paper",
  outline: "border border-stone-300 text-ink hover:border-ink",
  brass: "bg-ink text-paper hover:bg-ink-soft",
  whatsapp: "bg-whatsapp text-white hover:bg-whatsapp-dark",
  ghost: "text-ink hover:bg-stone-100",
  // MW "fill sweep": a paper ::before wipes in left→right on hover (origin-right→left
  // swap makes both enter+leave sweep the same way), text flips ink, 1px border stays.
  // Timing matched to MW's computed values: 0.45s + cubic-bezier(0.785,0.135,0.15,0.86).
  invert:
    "relative isolate border border-ink bg-ink text-paper duration-[450ms] ease-[cubic-bezier(0.785,0.135,0.15,0.86)] before:absolute before:inset-0 before:-z-10 before:origin-right before:scale-x-0 before:bg-paper before:transition-transform before:duration-[450ms] before:ease-[cubic-bezier(0.785,0.135,0.15,0.86)] before:content-[''] hover:text-ink hover:before:origin-left hover:before:scale-x-100 motion-reduce:before:transition-none",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-8 text-sm",
  icon: "h-10 w-10",
};

/** Class string for styling links (<a>/<Link>) as buttons. */
export function buttonClasses(
  variant: Variant = "primary",
  size: Size = "md",
  className?: string,
): string {
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return <button className={buttonClasses(variant, size, className)} {...props} />;
}
