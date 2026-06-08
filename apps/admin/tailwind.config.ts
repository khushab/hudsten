import type { Config } from "tailwindcss";
import hudstenPreset from "@hudsten/ui/tailwind-preset";

// Admin reuses the same design tokens as the storefront for visual consistency.
const config: Config = {
  presets: [hudstenPreset as Partial<Config>],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
};

export default config;
