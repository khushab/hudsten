import { z } from "zod";

/**
 * Newsletter signup — lead capture from launch (PRD §9). Rate-limited at the route layer.
 * `source` is a legit label (e.g. "footer", "home"). `website` is a hidden honeypot that
 * real users never fill; a non-empty value means a bot → reject silently.
 */
export const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email"),
  source: z.string().max(60).optional(),
  website: z.string().max(0).optional(),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;
