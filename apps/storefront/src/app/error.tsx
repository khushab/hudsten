"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

/**
 * Root error boundary — catches render/data failures on any route (PDP included)
 * instead of a hard crash. Must be a client component per Next.js contract.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="text-3xl font-normal">
        We hit a snag.
      </h1>
      <p className="max-w-prose text-stone-600">
        This is on us, not you. Try again — or head back home while we sort it
        out.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className={buttonClasses("primary", "md")}
        >
          Try again
        </button>
        <Link href="/" className={buttonClasses("outline", "md")}>
          Back to home
        </Link>
      </div>
    </main>
  );
}
