"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProductDetail, ReviewSummary, SiteSettings } from "@hudsten/db";
import {
  buildWhatsAppUrl,
  formatPrice,
} from "@hudsten/shared";
import { Gallery } from "./Gallery";
import { Price } from "@/components/ui/Price";
import { ProductBadges } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { CompactTrust } from "./CompactTrust";
import {
  CheckIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { trackAmazonClick, trackViewItem, trackWhatsAppClick } from "@/lib/analytics";
import { cn } from "@/lib/cn";

function isColorOption(name: string) {
  return name.toLowerCase() === "color";
}

export function ProductBuyBox({
  product,
  settings,
  productUrl,
  reviews,
}: {
  product: ProductDetail;
  settings: SiteSettings | null;
  productUrl: string;
  reviews: ReviewSummary;
}) {
  const colorOption = product.options.find((o) => isColorOption(o.name));

  // Default selection: first value of each option.
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const o of product.options) if (o.values[0]) init[o.id] = o.values[0].id;
    return init;
  });

  const valueLabel = useMemo(() => {
    const m = new Map<string, string>();
    for (const o of product.options)
      for (const v of o.values) m.set(v.id, v.value);
    return m;
  }, [product.options]);

  const activeColorId = colorOption ? (selected[colorOption.id] ?? null) : null;

  // Resolve the variant matching the full selection.
  const selectedVariant = useMemo(() => {
    const ids = Object.values(selected);
    if (ids.length === 0) return null;
    return (
      product.variants.find(
        (v) =>
          v.optionValueIds.length === ids.length &&
          ids.every((id) => v.optionValueIds.includes(id)),
      ) ?? null
    );
  }, [selected, product.variants]);

  // Is a candidate value available (some in-stock variant) given the other selections?
  const isAvailable = (optionId: string, valueId: string): boolean => {
    const trial = { ...selected, [optionId]: valueId };
    const ids = Object.values(trial);
    const v = product.variants.find(
      (variant) =>
        variant.optionValueIds.length === ids.length &&
        ids.every((id) => variant.optionValueIds.includes(id)),
    );
    // No variant data → treat as available (CTA still works as an inquiry).
    return v ? v.in_stock : true;
  };

  // Price + compare-at are ONE pricing unit. If a variant overrides the price, its
  // compare-at must come from the SAME variant (never the product's) — otherwise a
  // variant priced below the product's anchor would fabricate a discount it never had.
  const usingVariantPrice = selectedVariant?.price != null;
  const price = usingVariantPrice ? selectedVariant!.price! : product.price;
  const compareAt = usingVariantPrice
    ? selectedVariant!.compare_at_price
    : (selectedVariant?.compare_at_price ?? product.compare_at_price);
  const inStock = selectedVariant ? selectedVariant.in_stock : product.in_stock;

  const variantLabel =
    selectedVariant?.title ||
    Object.values(selected)
      .map((id) => valueLabel.get(id))
      .filter(Boolean)
      .join(" / ");

  // view_item once per product view.
  useEffect(() => {
    trackViewItem({
      id: product.id,
      name: product.title,
      price,
      currency: product.currency,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const waUrl = buildWhatsAppUrl({
    phoneNumber: settings?.whatsapp_number ?? "",
    template:
      product.whatsapp_message_template ??
      settings?.whatsapp_default_message_template,
    product: product.title,
    variant: variantLabel,
    price: formatPrice(price, product.currency),
    url: productUrl,
  });

  const amazonUrl =
    product.amazon_url && product.amazon_url.trim().length > 0
      ? product.amazon_url
      : null;

  const eventPayload = {
    id: product.id,
    name: product.title,
    price,
    currency: product.currency,
    variant: variantLabel,
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      <Gallery images={product.images} activeColorId={activeColorId} title={product.title} />

      <div>
        <ProductBadges badges={product.badges} className="mb-3" />
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {product.title}
        </h1>

        <div className="mt-4">
          <Price
            price={price}
            compareAt={compareAt}
            currency={product.currency}
            size="lg"
          />
        </div>

        {/* Social proof — only real reviews; hidden empty state (never fabricated). */}
        {reviews.count > 0 && reviews.average != null && (
          <p className="mt-2 text-sm text-stone-600">
            <span className="text-brass-600" aria-hidden="true">
              {"★".repeat(Math.round(reviews.average))}
            </span>{" "}
            {reviews.average.toFixed(1)} · {reviews.count}{" "}
            {reviews.count === 1 ? "review" : "reviews"}
          </p>
        )}

        {/* Options */}
        <div className="mt-7 space-y-6">
          {product.options.map((option) => {
            const isColor = isColorOption(option.name);
            return (
              <div key={option.id}>
                <p className="mb-2 text-sm font-medium">
                  {option.name}:{" "}
                  <span className="text-stone-500">
                    {valueLabel.get(selected[option.id] ?? "") ?? ""}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((v) => {
                    const isSel = selected[option.id] === v.id;
                    const available = isAvailable(option.id, v.id);
                    if (isColor) {
                      return (
                        <button
                          key={v.id}
                          type="button"
                          title={v.value}
                          aria-pressed={isSel}
                          aria-label={v.value}
                          onClick={() =>
                            setSelected((s) => ({ ...s, [option.id]: v.id }))
                          }
                          className={cn(
                            "relative h-10 w-10 rounded-full border transition-all",
                            isSel
                              ? "ring-2 ring-ink ring-offset-2 ring-offset-paper"
                              : "border-stone-300 hover:border-ink",
                            !available && "opacity-40",
                          )}
                          style={{ backgroundColor: v.color_hex ?? "#ddd" }}
                        >
                          {isSel && (
                            <CheckIcon
                              className="absolute inset-0 m-auto h-4 w-4 text-paper mix-blend-difference"
                            />
                          )}
                        </button>
                      );
                    }
                    return (
                      <button
                        key={v.id}
                        type="button"
                        aria-pressed={isSel}
                        onClick={() =>
                          setSelected((s) => ({ ...s, [option.id]: v.id }))
                        }
                        className={cn(
                          "min-w-[3rem] rounded-md border px-4 py-2.5 text-sm font-medium transition-colors",
                          isSel
                            ? "border-ink bg-ink text-paper"
                            : "border-stone-300 text-ink hover:border-ink",
                          !available && "text-stone-400 line-through",
                        )}
                      >
                        {v.value}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Stock status (honest) */}
        <p className="mt-5 flex items-center gap-2 text-sm">
          <span
            className={cn(
              "inline-block h-2 w-2 rounded-full",
              inStock ? "bg-success" : "bg-stone-400",
            )}
          />
          {inStock ? "In stock" : "Currently unavailable"}
        </p>

        {/* CTAs — ranked: WhatsApp primary, Amazon secondary (PRD §6). */}
        <div className="mt-5 space-y-3">
          {waUrl ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick(eventPayload)}
              className={buttonClasses("whatsapp", "lg", "w-full text-base")}
            >
              <WhatsAppIcon className="h-5 w-5" />
              Order on WhatsApp
            </a>
          ) : (
            <p className="rounded-md bg-stone-100 px-4 py-3 text-center text-sm text-stone-500">
              Ordering is being set up — please check back shortly.
            </p>
          )}

          {amazonUrl && (
            <a
              href={amazonUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              onClick={() => trackAmazonClick(eventPayload)}
              className="block text-center text-sm font-medium text-stone-600 underline underline-offset-4 hover:text-ink"
            >
              Prefer Amazon? Buy there →
            </a>
          )}
        </div>

        <CompactTrust className="mt-7" />
      </div>

      {/* Sticky mobile CTA bar (Hick's Law — one clear action). */}
      {waUrl && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-paper/95 p-3 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <Price
                price={price}
                compareAt={compareAt}
                currency={product.currency}
                size="sm"
              />
            </div>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick(eventPayload)}
              className={buttonClasses("whatsapp", "md", "flex-1")}
            >
              <WhatsAppIcon className="h-5 w-5" />
              Order on WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
