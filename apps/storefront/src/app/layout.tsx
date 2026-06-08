import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { absoluteUrl } from "@/lib/env";
import "./globals.css";

// Editorial grotesk display + clean grotesk body → the monochrome-luxe voice.
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

// MILESTONE 2 fills in dynamic, settings-driven metadata via generateMetadata per route.
export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: "Hudsten — Carry Better",
    template: "%s · Hudsten",
  },
  description:
    "Premium gym bags and lifestyle goods, handcrafted to outlast the hype.",
  openGraph: {
    type: "website",
    siteName: "Hudsten",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#111111",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
