import Image from "next/image";
import Link from "next/link";
import type { HeroSettings } from "@hudsten/db";
import { buttonClasses } from "@/components/ui/Button";

/** Home hero, driven by settings.hero. Mobile-first; LCP image is priority-loaded. */
export function Hero({ hero }: { hero: HeroSettings }) {
  const headline = hero.headline || "Carry Better.";
  const subtext =
    hero.subtext || "Premium gym bags, handcrafted to outlast the hype.";

  return (
    <section className="relative isolate overflow-hidden bg-ink text-paper">
      {hero.image_url && (
        <Image
          src={hero.image_url}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-60"
        />
      )}
      {/* Legibility gradient over the image. */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" />

      <div className="relative mx-auto flex min-h-[68vh] max-w-shell flex-col justify-end px-4 pb-14 pt-28 sm:px-6 lg:min-h-[78vh] lg:px-8 lg:pb-20">
        <div className="max-w-2xl">
          <p className="eyebrow text-brass-200">Premium Bags · Handcrafted</p>
          <h1 className="mt-3 text-5xl font-bold leading-[0.95] tracking-tightest sm:text-6xl lg:text-7xl">
            {headline}
          </h1>
          <p className="mt-5 max-w-md text-base text-paper/80 sm:text-lg">
            {subtext}
          </p>
          {hero.cta_link && (
            <Link
              href={hero.cta_link}
              className={buttonClasses("brass", "lg", "mt-8")}
            >
              {hero.cta_label || "Shop now"}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
