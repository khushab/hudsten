import Link from "next/link";

export interface Crumb {
  name: string;
  /** Relative path; omit on the current (last) crumb. */
  path?: string;
}

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-stone-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={`${c.name}-${i}`} className="flex items-center gap-1.5">
              {c.path && !last ? (
                <Link href={c.path} className="hover:text-ink">
                  {c.name}
                </Link>
              ) : (
                <span className={last ? "text-ink" : undefined} aria-current={last ? "page" : undefined}>
                  {c.name}
                </span>
              )}
              {!last && <span className="text-stone-300">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
