import { Container } from "@/components/ui/Container";

/** Skeleton for category/collection listing routes. */
export function ListingSkeleton() {
  return (
    <Container className="py-10">
      <div className="animate-pulse space-y-8">
        <div className="h-10 w-1/3 rounded bg-stone-200" />
        <div className="h-24 w-full rounded-lg bg-stone-200" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[4/5] rounded-lg bg-stone-200" />
              <div className="h-4 w-3/4 rounded bg-stone-200" />
              <div className="h-4 w-1/3 rounded bg-stone-200" />
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
