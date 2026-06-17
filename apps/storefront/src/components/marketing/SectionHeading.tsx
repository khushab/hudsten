import Link from "next/link";

/** Centered section heading (MW style — no eyebrow). Optional link sits centered below. */
export function SectionHeading({
  title,
  link,
}: {
  title: string;
  link?: { label: string; href: string };
}) {
  return (
    <div className="mb-8 text-center">
      <h2 className="text-2xl font-normal">{title}</h2>
      {link && (
        <Link
          href={link.href}
          className="mt-3 inline-block text-sm font-medium text-ink underline-offset-4 hover:underline"
        >
          {link.label} →
        </Link>
      )}
    </div>
  );
}
