"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsletterSchema, type NewsletterInput } from "@hudsten/shared";
import { Button } from "@/components/ui/Button";
import { trackNewsletterSignup } from "@/lib/analytics";
import { cn } from "@/lib/cn";

/** Newsletter signup. Honest lead capture — no dark patterns. `tone="dark"` adapts
 *  the input + button + success text for placement on a dark surface (the footer). */
export function NewsletterForm({
  source = "footer",
  tone = "light",
  className,
}: {
  source?: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { source, website: "" },
  });

  async function onSubmit(values: NewsletterInput) {
    setServerError(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setServerError(data.error ?? "Something went wrong.");
        return;
      }
      trackNewsletterSignup(source);
      setDone(true);
    } catch {
      setServerError("Network error. Please try again.");
    }
  }

  if (done) {
    return (
      <p
        className={cn("text-sm", dark ? "text-stone-300" : "text-stone-600", className)}
        role="status"
      >
        You're on the list. First dibs on drops, straight to your inbox.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("w-full", className)}
      noValidate
    >
      {/* Honeypot: visually hidden, off the tab order. Bots fill it; humans don't. */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
        {...register("website")}
      />
      <input type="hidden" {...register("source")} />

      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={`nl-${source}`} className="sr-only">
          Email address
        </label>
        <input
          id={`nl-${source}`}
          type="email"
          inputMode="email"
          placeholder="you@email.com"
          // sm:flex-1 (not flex-1): in the mobile COLUMN layout flex-1 would govern
          // height and collapse the h-11; appearance-none kills iOS native styling.
          className={cn(
            "h-11 w-full appearance-none px-4 text-sm outline-none transition-colors sm:flex-1",
            dark
              ? "border border-white/20 bg-transparent text-paper placeholder:text-stone-500 focus:border-paper"
              : "border border-stone-300 bg-paper focus:border-ink",
          )}
          {...register("email")}
        />
        <Button
          type="submit"
          variant="invert"
          disabled={isSubmitting}
          // On the dark footer the sweep mirrors: paper button → ink fills in, text flips to paper.
          className={
            dark
              ? "border-paper bg-paper text-ink before:bg-ink hover:text-paper"
              : undefined
          }
        >
          {isSubmitting ? "Joining…" : "Subscribe"}
        </Button>
      </div>
      {(errors.email || serverError) && (
        <p className="mt-2 text-xs text-danger" role="alert">
          {errors.email?.message ?? serverError}
        </p>
      )}
    </form>
  );
}
