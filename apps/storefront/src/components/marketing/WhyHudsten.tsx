import Link from "next/link";
import { ShieldIcon, ReturnIcon, CheckIcon } from "@/components/icons";

const PILLARS = [
  {
    Icon: CheckIcon,
    title: "Materials that outlast trends",
    body: "Ballistic weave, full-grain trim, YKK hardware.",
  },
  {
    Icon: ShieldIcon,
    title: "Built in small batches",
    body: "Handcrafted in India, inspected seam by seam.",
  },
  {
    Icon: ReturnIcon,
    title: "The risk is on us",
    body: "1-year warranty, 7-day returns. No questions.",
  },
];

/**
 * Brand-story block (PRD §6: founder story + specs + warranty substitute for reviews
 * while the brand is new). The founder link is the authority/social-proof bridge.
 */
export function WhyHudsten() {
  return (
    <section className="border-y border-stone-200 bg-ink text-paper">
      <div className="mx-auto max-w-shell px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <p className="eyebrow text-paper/70">Why Hudsten</p>
        <h2 className="mt-3 max-w-2xl text-2xl font-normal">
          Built to outlast the hype.
        </h2>
        <div className="mt-10 grid gap-10 sm:grid-cols-3">
          {PILLARS.map(({ Icon, title, body }) => (
            <div key={title}>
              <Icon className="h-6 w-6 text-paper" />
              <h3 className="mt-3 font-display text-lg font-medium">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-paper/70">{body}</p>
            </div>
          ))}
        </div>
        <Link
          href="/about"
          className="mt-10 inline-block whitespace-nowrap text-xs font-medium uppercase tracking-[0.12em] text-paper/80 underline underline-offset-4 hover:text-paper"
        >
          Meet the maker →
        </Link>
      </div>
    </section>
  );
}
