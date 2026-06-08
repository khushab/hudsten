import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
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

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: { default: "Hudsten — Carry Better", template: "%s · Hudsten" },
  description:
    "Premium gym bags and lifestyle goods, handcrafted to outlast the hype.",
  openGraph: { type: "website", siteName: "Hudsten" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#111111",
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
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <ConsentProvider>
          <AnnouncementBar text={settings?.announcement_bar} />
          <Header nav={nav} settings={settings} />
          <div className="flex-1">{children}</div>
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
