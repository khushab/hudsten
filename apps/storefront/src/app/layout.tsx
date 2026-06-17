import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import type { NavNode, SiteSettings } from "@hudsten/db";
import { absoluteUrl } from "@/lib/env";
import { fetchNavigation, fetchSettings } from "@/lib/data";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ConsentProvider } from "@/components/analytics/consent";
import { Analytics } from "@/components/analytics/Analytics";
import { CookieConsent } from "@/components/analytics/CookieConsent";
import "./globals.css";

// Instrument Sans — the exact face the Mission Workshop reference uses. next/font
// SELF-HOSTS it (bundled + served from our own origin), so it renders identically on
// every OS/browser — no system-font variance, no runtime Google request. --font-display
// is aliased to --font-sans in globals.css, so headings and body share the same face.
const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: { default: "Hudsten — Carry Better", template: "%s · Hudsten" },
  description:
    "Premium gym bags and lifestyle goods, handcrafted to outlast the hype.",
  // Branded default OG image — pages with real imagery (PDP/listings) override it.
  openGraph: { type: "website", siteName: "Hudsten", images: ["/og-default.png"] },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#1C1C1C",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout data is resilient: a transient DB/env issue degrades gracefully
  // (empty nav/default settings) rather than breaking every page.
  let nav: NavNode[] = [];
  let settings: SiteSettings | null = null;
  try {
    [nav, settings] = await Promise.all([fetchNavigation(), fetchSettings()]);
  } catch {
    // Render a usable shell even if catalog data is briefly unavailable.
  }

  return (
    <html lang="en" className={sans.variable}>
      <body className="flex min-h-dvh flex-col">
        {/* Keyboard users skip the sticky header/nav on every page. */}
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-md focus:bg-ink focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-paper"
        >
          Skip to content
        </a>
        <ConsentProvider>
          <AnnouncementBar text={settings?.announcement_bar} />
          <Header nav={nav} settings={settings} />
          <div id="content" className="flex-1">{children}</div>
          <Footer settings={settings} />
          <CookieConsent />
          <Analytics
            ga4Id={process.env.NEXT_PUBLIC_GA4_ID || undefined}
            pixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID || undefined}
          />
        </ConsentProvider>
      </body>
    </html>
  );
}
