import { cn } from "@/lib/cn";

/**
 * Disclosure built on native <details>/<summary>: accessible + keyboard-operable +
 * works without JS (progressive enhancement). Used for PDP sections + FAQ.
 */
export function Accordion({
  title,
  children,
  defaultOpen = false,
  className,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  return (
    <details
      open={defaultOpen}
      className={cn("group border-b border-stone-200", className)}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-display text-sm font-medium uppercase tracking-caps [&::-webkit-details-marker]:hidden">
        {title}
        <svg
          className="h-5 w-5 shrink-0 text-stone-400 transition-transform duration-200 ease-lux group-open:rotate-45"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M10 4v12M4 10h12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </summary>
      <div className="pb-5 pt-1 text-sm leading-relaxed text-stone-600">
        {children}
      </div>
    </details>
  );
}
