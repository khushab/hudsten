"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsletterSchema, type NewsletterInput } from "@hudsten/shared";
import { Button } from "@/components/ui/Button";
import { trackNewsletterSignup } from "@/lib/analytics";
import { cn } from "@/lib/cn";

/** Newsletter signup. Honest lead capture — no dark patterns. */
export function NewsletterForm({
  source = "footer",
  className,
}: {
  source?: string;
  className?: string;
}) {
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
      <p className={cn("text-sm text-stone-600", className)} role="status">
        Thanks — you're on the list. Watch your inbox for first dibs on new drops.
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
          className="h-11 w-full appearance-none rounded-md border border-stone-300 bg-paper px-4 text-sm outline-none transition-colors focus:border-ink sm:flex-1"
          {...register("email")}
        />
        <Button type="submit" variant="primary" disabled={isSubmitting}>
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
