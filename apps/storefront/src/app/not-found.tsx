import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="shell flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
      <p className="eyebrow">404</p>
      <h1 className="text-4xl font-normal sm:text-5xl">
        This page wandered off.
      </h1>
      <p className="max-w-prose text-stone-600">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link href="/" className={buttonClasses("primary", "md", "mt-2")}>
        Back to home
      </Link>
    </main>
  );
}
