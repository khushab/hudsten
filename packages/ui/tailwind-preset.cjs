/**
 * Hudsten shared Tailwind preset — Mission Workshop-inspired technical monochrome.
 *
 * Design intent: near-black ink on cool white, neutral grays + hairlines (no drop
 * shadows), square corners, a single neutral grotesk (Inter), uppercase + tracked
 * headings/labels. One restrained green is reserved for the primary WhatsApp CTA
 * + trust cues — everything else is monochrome.
 *
 * Consumed by both apps via `presets: [require('@hudsten/ui/tailwind-preset')]`.
 * Font CSS variables (--font-display / --font-sans) are wired per-app (next/font, etc.);
 * --font-display is aliased to --font-sans so the whole brand uses one grotesk.
 *
 * Token NAMES are preserved (ink/paper/brass/stone/whatsapp/…) so component classes keep
 * working; only their VALUES changed for the restyle. `brass` is intentionally neutralized
 * to monochrome (MW has no metallic accent) rather than removed, to avoid breaking refs.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1C1C1C",
          soft: "#1F1F1D",
          muted: "#2E2E2E",
        },
        paper: {
          DEFAULT: "#FFFFFF", // cool white (MW), not warm
          dim: "#F5F5F3", // image / surface background
          deep: "#ECECEA",
        },
        // Neutralized to monochrome — kept only so existing `*-brass` refs render grey, not break.
        brass: {
          DEFAULT: "#171717",
          50: "#F5F5F3",
          100: "#E4E4E2",
          200: "#D6D6D3",
          300: "#B0B0AD",
          400: "#8A8A87",
          500: "#6E6E6A",
          600: "#4A4A46",
          700: "#333330",
          800: "#232320",
          900: "#171715",
        },
        // Neutral cool-grey scale for borders, text, surfaces. Text stops (500/600) are AA-safe.
        stone: {
          50: "#FAFAFA",
          100: "#F5F5F3",
          200: "#E4E4E2", // hairline
          300: "#D6D6D3",
          400: "#9A9A96", // borders / decorative only (not text)
          500: "#6E6E6A", // muted text / eyebrow — AA on white & #F5F5F3
          600: "#4A4A46",
          700: "#333330",
          800: "#232320",
          900: "#171715",
          950: "#0D0D0B",
        },
        success: "#1F7A4D",
        danger: "#B42318",
        // The one reserved accent — a clean, modern green for the primary CTA.
        whatsapp: {
          DEFAULT: "#16A34A",
          dark: "#15803D",
        },
      },
      fontFamily: {
        // One neutral grotesk (Inter) for the whole brand; --font-display aliases --font-sans.
        display: ['var(--font-display)', "Instrument Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ['var(--font-sans)', "Instrument Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Neutral tracking on the scale; uppercase tracking is applied via base styles/utilities.
        "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.04em" }],
        xs: ["0.75rem", { lineHeight: "1.1rem" }],
        sm: ["0.875rem", { lineHeight: "1.35rem" }],
        base: ["1rem", { lineHeight: "1.65rem" }],
        lg: ["1.125rem", { lineHeight: "1.7rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "1.9rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.2rem" }],
        "4xl": ["2.5rem", { lineHeight: "2.7rem" }],
        "5xl": ["3.25rem", { lineHeight: "3.4rem" }],
        "6xl": ["4.25rem", { lineHeight: "4.4rem" }],
        "7xl": ["5.5rem", { lineHeight: "5.5rem" }],
      },
      letterSpacing: {
        tightest: "-0.04em",
        caps: "0.18em", // uppercase headings / buttons (matches the MW reference)
        eyebrow: "0.18em", // small uppercase labels / eyebrows
      },
      borderRadius: {
        // MW = square corners everywhere; only `full` kept for circular swatches/avatars.
        none: "0",
        xs: "0",
        sm: "0",
        DEFAULT: "0",
        md: "0",
        lg: "0",
        xl: "0",
        "2xl": "0",
        full: "9999px",
      },
      boxShadow: {
        // MW structures with hairlines, not shadows.
        subtle: "none",
        card: "none",
        lift: "none",
        focus: "0 0 0 2px rgba(23,23,23,0.45)",
      },
      maxWidth: {
        prose: "68ch",
        shell: "88rem", // page container
      },
      spacing: {
        "section": "5.5rem", // vertical rhythm between page sections
        "section-sm": "3.5rem",
      },
      transitionTimingFunction: {
        lux: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
};
