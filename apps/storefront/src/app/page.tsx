// MILESTONE 1 skeleton home — proves the toolchain + design system boot.
// MILESTONE 2 replaces this with the data-driven home (hero from settings,
// featured collection grid, trust strip, newsletter).
export default function HomePage() {
  return (
    <main className="shell flex min-h-dvh flex-col items-center justify-center gap-6 text-center">
      <p className="eyebrow">Premium Bags · Handcrafted</p>
      <h1 className="text-6xl font-semibold tracking-tightest sm:text-7xl">
        HUDSTEN
      </h1>
      <p className="max-w-prose text-lg text-stone-600">
        Carry better. Storefront scaffold is live — the data-driven home,
        listings, and product page land in Milestone&nbsp;2.
      </p>
      <div className="mt-4 flex items-center gap-3">
        <span className="inline-flex h-8 items-center rounded-full bg-ink px-4 text-2xs uppercase tracking-eyebrow text-paper">
          Monochrome Luxe
        </span>
        <span className="inline-flex h-8 items-center rounded-full border border-stone-300 px-4 text-2xs uppercase tracking-eyebrow text-stone-600">
          Brass Accent
        </span>
        <span className="inline-flex h-8 items-center rounded-full bg-brass px-4 text-2xs font-medium uppercase tracking-eyebrow text-ink">
          ₹ INR
        </span>
      </div>
    </main>
  );
}
