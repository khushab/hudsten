import { z } from "zod";

/** Newsletter signup — lead capture from launch (PRD §9). Rate-limited at the route layer. */
export const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email"),
  /** Honeypot field; must stay empty. Bots fill it → reject silently. */
  source: z.string().max(60).optional(),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;
