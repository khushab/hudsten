import Link from "next/link";
import type { NavNode, SiteSettings } from "@hudsten/db";
import { buildWhatsAppGeneralUrl } from "@hudsten/shared";
import { SearchIcon, WhatsAppIcon } from "@/components/icons";
import { Nav } from "./Nav";
import { MobileNav } from "./MobileNav";

export function Header({
  nav,
  settings,
}: {
  nav: NavNode[];
  settings: SiteSettings | null;
}) {
  const waUrl = buildWhatsAppGeneralUrl(settings?.whatsapp_number);
  const storeName = settings?.store_name ?? "Hudsten";
  const logoUrl = settings?.logo_url;

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-shell items-center gap-3 px-4 sm:px-6 lg:px-8">
        <MobileNav items={nav} />

        <Link
          href="/"
          className="font-display text-base font-medium tracking-[0.22em] lg:mr-4"
          aria-label={`${storeName} home`}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={storeName} className="h-7 w-auto" />
          ) : (
            storeName.toUpperCase()
          )}
        </Link>

        <div className="flex-1">
          <Nav items={nav} />
        </div>

        <div className="flex items-center gap-1">
          <Link
            href="/search"
            aria-label="Search"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-ink hover:bg-stone-100"
          >
            <SearchIcon className="h-5 w-5" />
          </Link>
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-ink hover:bg-stone-100"
            >
              <WhatsAppIcon className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
