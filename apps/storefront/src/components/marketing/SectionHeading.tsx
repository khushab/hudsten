import Link from "next/link";

export function SectionHeading({
  eyebrow,
  title,
  link,
}: {
  eyebrow?: string;
  title: string;
  link?: { label: string; href: string };
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h2>
      </div>
      {link && (
        <Link
          href={link.href}
          className="shrink-0 text-sm font-medium text-ink underline-offset-4 hover:underline"
        >
          {link.label} →
        </Link>
      )}
    </div>
  );
}
