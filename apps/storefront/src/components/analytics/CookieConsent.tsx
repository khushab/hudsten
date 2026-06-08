"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useConsent } from "./consent";

/** Cookie-consent banner (PRD §9). Shows until the visitor chooses; no dark patterns. */
export function CookieConsent() {
  const { consent, setConsent } = useConsent();
  if (consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-2xl rounded-lg border border-stone-200 bg-paper p-4 shadow-lift animate-fade-in sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-stone-600">
          We use cookies for analytics to improve your experience. See our{" "}
          <Link href="/policies/privacy" className="underline hover:text-ink">
            privacy policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="ghost" onClick={() => setConsent("denied")}>
            Decline
          </Button>
          <Button size="sm" variant="primary" onClick={() => setConsent("granted")}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
