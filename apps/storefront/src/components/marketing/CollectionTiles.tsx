import Image from "next/image";
import Link from "next/link";

export interface CollectionTile {
  name: string;
  href: string;
  image: { url: string; alt_text: string | null } | null;
}

/**
 * "Shop by" tiles after the hero — gives shoppers an instant path into the catalog
 * instead of relying on the navbar alone (also internal-linking SEO value).
 */
export function CollectionTiles({ tiles }: { tiles: CollectionTile[] }) {
  if (tiles.length === 0) return null;

  return (
    <div
      className={
        tiles.length <= 2
          ? "grid grid-cols-1 gap-4 sm:grid-cols-2"
          : "grid grid-cols-1 gap-4 sm:grid-cols-3"
      }
    >
      {tiles.map((tile) => (
        <Link
          key={tile.href}
          href={tile.href}
          className="group relative block aspect-[4/3] overflow-hidden rounded-xl bg-ink sm:aspect-[3/4] lg:aspect-[4/3]"
        >
          {tile.image && (
            <Image
              src={tile.image.url}
              alt={tile.image.alt_text ?? tile.name}
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-cover opacity-80 transition-transform duration-500 ease-lux group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-5">
            <span className="font-display text-xl font-semibold text-paper">
              {tile.name}
            </span>
            <span
              aria-hidden="true"
              className="text-paper/80 transition-transform duration-300 ease-lux group-hover:translate-x-1"
            >
              →
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
