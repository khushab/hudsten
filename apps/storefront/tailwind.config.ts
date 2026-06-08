import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
// eslint-disable-next-line @typescript-eslint/no-var-requires
import hudstenPreset from "@hudsten/ui/tailwind-preset";

const config: Config = {
  presets: [hudstenPreset as Partial<Config>],
  content: [
    "./src/**/*.{ts,tsx}",
    // Scan shared UI package if it grows components later.
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  plugins: [typography],
};

export default config;
