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
      {/* Three zones (1fr · auto · 1fr) keep the logo dead-centre regardless of the
          left/right widths — Mission Workshop-style centred mark. */}
      <div className="mx-auto grid h-20 max-w-shell grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* Left — hamburger on mobile, primary nav on desktop */}
        <div className="flex items-center gap-3 justify-self-start">
          <MobileNav items={nav} />
          <Nav items={nav} />
        </div>

        {/* Centre — logo lockup: icon over the wordmark */}
        <Link
          href="/"
          className="flex flex-col items-center gap-1 justify-self-center font-display text-sm font-medium tracking-[0.2em]"
          aria-label={`${storeName} home`}
        >
          {logoUrl && (
            // Icon mark above the wordmark; alt empty + aria-hidden since the text carries the name.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" aria-hidden="true" className="h-7 w-auto" />
          )}
          {storeName.toUpperCase()}
        </Link>

        {/* Right — actions */}
        <div className="flex items-center gap-1 justify-self-end">
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
