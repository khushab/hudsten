/** @type {import('next').NextConfig} */
const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : undefined;
  } catch {
    return undefined;
  }
})();

const nextConfig = {
  reactStrictMode: true,
  // @hudsten/* are source-only workspace packages (no build step) — transpile them.
  transpilePackages: ["@hudsten/shared", "@hudsten/db", "@hudsten/ui"],
  // jsdom (via isomorphic-dompurify) reads asset files at runtime — webpack
  // bundling breaks those paths, so load it from node_modules instead.
  serverExternalPackages: ["isomorphic-dompurify", "jsdom"],
  images: {
    // AVIF/WebP + remote sources. Supabase Storage CDN host is added from env at build.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Placeholder image service used in seed data — replace with real photography.
      { protocol: "https", hostname: "placehold.co" },
      ...(supabaseHost
        ? [{ protocol: "https", hostname: supabaseHost }]
        : [{ protocol: "https", hostname: "*.supabase.co" }]),
    ],
  },
  // Secure headers (PRD §9). HTTPS is enforced by the host (Vercel).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
