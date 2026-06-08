import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchSettings } from "@/lib/data";
import { absoluteUrl } from "@/lib/env";
import { Container } from "@/components/ui/Container";

export const revalidate = 3600;

const POLICIES = {
  privacy: "Privacy Policy",
  terms: "Terms & Conditions",
  shipping: "Shipping Policy",
  returns: "Returns & Refunds",
} as const;

type PolicyKey = keyof typeof POLICIES;

export function generateStaticParams() {
  return Object.keys(POLICIES).map((policy) => ({ policy }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ policy: string }>;
}): Promise<Metadata> {
  const { policy } = await params;
  const title = POLICIES[policy as PolicyKey];
  if (!title) return { title: "Not found" };
  return {
    title,
    alternates: { canonical: absoluteUrl(`/policies/${policy}`) },
    robots: { index: true },
  };
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ policy: string }>;
}) {
  const { policy } = await params;
  const title = POLICIES[policy as PolicyKey];
  if (!title) notFound();

  const settings = await fetchSettings();
  const body = settings?.policies[policy as PolicyKey];

  return (
    <Container as="main" className="max-w-prose py-12 sm:py-16">
      <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
      <div className="prose prose-stone mt-8 max-w-none">
        {body ? (
          <div dangerouslySetInnerHTML={{ __html: body }} />
        ) : (
          <p className="text-stone-500">
            This policy is being finalised. Please contact us with any questions
            in the meantime.
          </p>
        )}
      </div>
    </Container>
  );
}
