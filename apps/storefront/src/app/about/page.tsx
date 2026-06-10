import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/env";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/ui/JsonLd";
import { TrustStrip } from "@/components/marketing/TrustStrip";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "About",
  description:
    "Hudsten makes premium bags built to outlast the hype — founder-led, obsessively made.",
  alternates: { canonical: absoluteUrl("/about") },
};

export default function AboutPage() {
  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About Hudsten",
          description:
            "Hudsten makes premium bags built to outlast the hype — founder-led, obsessively made.",
          url: absoluteUrl("/about"),
        }}
      />
      <Container className="max-w-prose py-14 sm:py-20">
        <p className="eyebrow mb-3">Our story</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Built to outlast the hype.
        </h1>
        {/* [PLACEHOLDER] Founder story — replace with the real brand narrative. */}
        <div className="prose prose-stone mt-8 max-w-none">
          <p>
            Hudsten started with a simple frustration: gym bags that looked good
            for a month, then fell apart at the seams. We set out to make the
            opposite — bags engineered for the daily grind, finished like
            something you'd be proud to carry into a meeting.
          </p>
          <p>
            Every piece is built around three non-negotiables: materials that
            age well, hardware that doesn't quit, and details that earn their
            place. No gimmicks, no fake urgency — just bags we'd carry ourselves,
            backed by a real warranty and honest returns.
          </p>
          <p>
            We're just getting started, launching with gym bags and expanding
            into wallets, leather goods, and apparel. Thanks for being early.
          </p>
        </div>
      </Container>
      <TrustStrip />
    </main>
  );
}
