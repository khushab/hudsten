import { forwardRef } from "react";
import { cn } from "@/lib/cn";

// ── Button ────────────────────────────────────────────────────────────────────
type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md";
const btnVariants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-paper hover:bg-ink-soft",
  secondary: "border border-stone-300 bg-paper text-ink hover:border-ink",
  danger: "bg-danger text-white hover:opacity-90",
  ghost: "text-ink hover:bg-stone-100",
};
const btnSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
};
export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        btnVariants[variant],
        btnSizes[size],
        className,
      )}
      {...props}
    />
  );
}

// ── Inputs ──────────────────────────────────────────────────────────────────
const fieldBase =
  "w-full rounded-md border border-stone-300 bg-paper px-3 py-2 text-sm outline-none transition-colors focus:border-ink disabled:bg-stone-100";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(fieldBase, className)} {...props} />;
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(fieldBase, "min-h-24", className)} {...props} />;
});

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, ...props }, ref) {
  return <select ref={ref} className={cn(fieldBase, "pr-8", className)} {...props} />;
});

// ── Field wrapper ─────────────────────────────────────────────────────────────
export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-stone-500">{hint}</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "inline-flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors",
          checked ? "bg-ink" : "bg-stone-300",
        )}
      >
        <span
          className={cn(
            "h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </button>
      {label && <span className="text-sm">{label}</span>}
    </label>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({
  title,
  children,
  className,
  actions,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-lg border border-stone-200 bg-paper", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3.5">
          {title && <h2 className="font-display text-base font-semibold">{title}</h2>}
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

// ── Misc ───────────────────────────────────────────────────────────────────────
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-ink",
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-stone-500">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function ErrorNote({ error }: { error: unknown }) {
  if (!error) return null;
  const msg = error instanceof Error ? error.message : String(error);
  return (
    <div className="rounded-md border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
      {msg}
    </div>
  );
}
