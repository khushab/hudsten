import { Container } from "@/components/ui/Container";

// Instant skeleton shown while the PDP loads (route transitions / ISR revalidation).
export default function Loading() {
  return (
    <Container className="py-10">
      <div className="grid animate-pulse gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="aspect-[4/5] rounded-xl bg-stone-200" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 rounded bg-stone-200" />
          <div className="h-6 w-1/3 rounded bg-stone-200" />
          <div className="h-10 w-1/2 rounded bg-stone-200" />
          <div className="h-12 w-full rounded bg-stone-200" />
          <div className="h-12 w-full rounded bg-stone-200" />
        </div>
      </div>
    </Container>
  );
}
