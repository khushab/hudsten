import Link from "next/link";
import type { SiteSettings } from "@hudsten/db";
import { InstagramIcon } from "@/components/icons";
import { NewsletterForm } from "./NewsletterForm";

const POLICY_LINKS = [
  { label: "Privacy", href: "/policies/privacy" },
  { label: "Terms", href: "/policies/terms" },
  { label: "Shipping", href: "/policies/shipping" },
  { label: "Returns", href: "/policies/returns" },
];

const SHOP_LINKS = [
  { label: "Gym Bags", href: "/c/gym-bags" },
  { label: "All collections", href: "/collections" },
  { label: "New Arrivals", href: "/collections/new-arrivals" },
  { label: "Men", href: "/collections/mens-gym-bags" },
  { label: "Women", href: "/collections/womens-gym-bags" },
];

// MW-style dark footer (#1C1C1C). Light text/links sized for AA contrast on near-black.
export function Footer({ settings }: { settings: SiteSettings | null }) {
  const storeName = settings?.store_name ?? "Hudsten";
  const year = new Date().getFullYear();
  const social = settings?.social ?? {};

  return (
    <footer className="mt-section bg-[#1C1C1C] text-stone-300">
      <div className="mx-auto max-w-shell px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand + newsletter */}
          <div className="col-span-2 lg:col-span-2">
            <p className="font-display text-base font-medium tracking-[0.22em] text-paper">
              {storeName.toUpperCase()}
            </p>
            <p className="mt-3 max-w-sm text-sm text-stone-400">
              Handcrafted to outlast the hype. Join for first dibs on drops.
            </p>
            <NewsletterForm source="footer" tone="dark" className="mt-5 max-w-md" />
          </div>

          <FooterCol title="Shop" links={SHOP_LINKS} />
          <FooterCol
            title="Company"
            links={[
              { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },
            ]}
          />
          <FooterCol title="Policies" links={POLICY_LINKS} />
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-white/10 pt-8 text-sm text-stone-400 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            {settings?.address && <p>{settings.address}</p>}
            <p className="flex flex-wrap gap-x-4">
              {settings?.contact_email && (
                <a href={`mailto:${settings.contact_email}`} className="transition-colors hover:text-paper">
                  {settings.contact_email}
                </a>
              )}
              {settings?.phone && (
                <a href={`tel:${settings.phone}`} className="transition-colors hover:text-paper">
                  {settings.phone}
                </a>
              )}
            </p>
            {settings?.gst_number && (
              <p className="text-xs text-stone-400">GSTIN: {settings.gst_number}</p>
            )}
          </div>

          {social.instagram && (
            <a
              href={social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex h-10 w-10 items-center justify-center border border-white/20 text-stone-300 transition-colors hover:border-paper hover:text-paper"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
          )}
        </div>

        <p className="mt-8 text-xs text-stone-400">
          © {year} {storeName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="text-2xs font-medium uppercase tracking-eyebrow text-stone-400">
        {title}
      </p>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-sm text-stone-400 transition-colors hover:text-paper"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
