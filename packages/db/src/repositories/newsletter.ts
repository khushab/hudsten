import type { HudstenClient } from "../supabase/client";
import { RepositoryError } from "./_shared";

export type SubscribeResult = "subscribed" | "already_subscribed";

/**
 * Insert a newsletter subscriber. Anon insert is allowed by RLS. A duplicate email
 * (unique violation 23505) is treated as success — we never reveal whether an email
 * was already on the list (privacy). Validation/rate-limiting happen at the route layer.
 */
export async function subscribeToNewsletter(
  client: HudstenClient,
  email: string,
  source?: string,
): Promise<SubscribeResult> {
  const res = await client
    .from("newsletter_subscribers")
    .insert({ email: email.toLowerCase().trim(), source: source ?? null });
  if (res.error) {
    if (res.error.code === "23505") return "already_subscribed";
    throw new RepositoryError(
      `subscribeToNewsletter: ${res.error.message}`,
      res.error,
    );
  }
  return "subscribed";
}
