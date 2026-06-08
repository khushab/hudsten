import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/search"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    // Host directive expects a bare hostname (not a full URL).
    host: new URL(absoluteUrl("/")).host,
  };
}
