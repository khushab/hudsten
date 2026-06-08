import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Admin is a pure SPA (no SEO). It talks to Supabase via the anon key + the
// logged-in admin's JWT; RLS does the authorization. The service-role key is
// NEVER bundled here (PRD §7 security).
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
});
