import Image from "next/image";
import Link from "next/link";
import type { ProductCard as ProductCardType } from "@hudsten/db";
import { ROUTES } from "@hudsten/shared";
import { Price } from "@/components/ui/Price";
import { ProductBadges } from "@/components/ui/Badge";

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductCardType;
  priority?: boolean;
}) {
  return (
    <Link href={`${ROUTES.product}/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-paper-dim">
        {product.primaryImage ? (
          <Image
            src={product.primaryImage.url}
            alt={product.primaryImage.alt_text ?? product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            className="object-cover transition-transform duration-500 ease-lux group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-stone-400">
            No image
          </div>
        )}
        <ProductBadges badges={product.badges} className="absolute left-3 top-3" />
        {!product.in_stock && (
          <div className="absolute inset-x-0 bottom-0 bg-ink/80 py-1.5 text-center text-2xs font-medium uppercase tracking-eyebrow text-paper">
            Sold out
          </div>
        )}
      </div>
      <div className="mt-3 space-y-1.5">
        <h3 className="font-display text-base font-medium leading-snug tracking-tight group-hover:underline">
          {product.title}
        </h3>
        <Price
          price={product.price}
          compareAt={product.compare_at_price}
          currency={product.currency}
          size="sm"
        />
      </div>
    </Link>
  );
}
