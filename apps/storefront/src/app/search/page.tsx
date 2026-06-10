import type { Metadata } from "next";
import { fetchProductCards } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { ProductGrid, EmptyProducts } from "@/components/product/ProductGrid";
import { SearchIcon } from "@/components/icons";

// Dynamic: depends on the ?q query. Lightweight title ILIKE search.
// PHASE 2/DECISION: upgrade to Postgres full-text search or Algolia/Typesense.
export const metadata: Metadata = {
  title: "Search",
  robots: { index: false },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = query ? await fetchProductCards({ query, limit: 24 }) : [];

  return (
    <Container as="main" className="py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Search</h1>

      <form action="/search" method="get" className="mt-6 max-w-md">
        <div className="flex items-center gap-2 rounded-md border border-stone-300 bg-paper px-3 focus-within:border-ink">
          <SearchIcon className="h-5 w-5 text-stone-400" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search products…"
            autoComplete="off"
            enterKeyHint="search"
            className="h-11 flex-1 bg-transparent text-sm outline-none"
            aria-label="Search products"
          />
        </div>
      </form>

      <div className="mt-10">
        {!query ? (
          <p className="text-sm text-stone-500">
            Type above to search the catalog.
          </p>
        ) : results.length > 0 ? (
          <>
            <p className="mb-6 text-sm text-stone-500">
              {results.length} result{results.length === 1 ? "" : "s"} for “{query}”
            </p>
            <ProductGrid products={results} />
          </>
        ) : (
          <EmptyProducts message={`No products match “${query}”.`} />
        )}
      </div>
    </Container>
  );
}
