/**
 * Hudsten shared Tailwind preset — "Modern Monochrome Luxe".
 *
 * Design intent: near-black ink + warm off-white paper + a single brass accent, big
 * confident type, architectural (low) radii, restrained shadows. NOT generic-AI:
 * editorial grotesk display, generous whitespace, high contrast.
 *
 * Consumed by both apps via `presets: [require('@hudsten/ui/tailwind-preset')]`.
 * Font CSS variables (--font-display / --font-sans) are wired per-app (next/font, etc.).
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        // Brand core
        ink: {
          DEFAULT: "#111111",
          soft: "#1C1C1A",
          muted: "#3A3A36",
        },
        paper: {
          DEFAULT: "#FAFAF7", // warm off-white, not pure white
          dim: "#F2F0EA",
          deep: "#E9E6DD",
        },
        brass: {
          DEFAULT: "#C9A227",
          50: "#FBF6E7",
          100: "#F5EAC2",
          200: "#EAD488",
          300: "#DCBB4E",
          400: "#CFAA34",
          500: "#C9A227",
          600: "#A6831C",
          700: "#7E6316",
          800: "#574414",
          900: "#3B2F12",
        },
        // Warm neutral scale (stone-leaning) for borders, text, surfaces
        stone: {
          50: "#FAFAF7",
          100: "#F2F0EA",
          200: "#E5E2D8",
          300: "#D2CDBE",
          400: "#A8A293",
          500: "#7C766A",
          600: "#5C574D",
          700: "#433F38",
          800: "#2B2925",
          900: "#1A1916",
          950: "#0E0D0B",
        },
        // Semantic
        success: "#1F7A4D",
        danger: "#B42318",
        whatsapp: {
          DEFAULT: "#25D366",
          dark: "#1EBE5A",
        },
      },
      fontFamily: {
        // Editorial grotesk display + clean grotesk body (wired per-app).
        display: ['var(--font-display)', "Bricolage Grotesque", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ['var(--font-sans)', "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Modular scale, tight leading on display sizes for a confident editorial feel.
        "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.04em" }],
        xs: ["0.75rem", { lineHeight: "1.1rem" }],
        sm: ["0.875rem", { lineHeight: "1.35rem" }],
        base: ["1rem", { lineHeight: "1.6rem" }],
        lg: ["1.125rem", { lineHeight: "1.7rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "1.9rem", letterSpacing: "-0.01em" }],
        "3xl": ["1.875rem", { lineHeight: "2.2rem", letterSpacing: "-0.015em" }],
        "4xl": ["2.5rem", { lineHeight: "2.7rem", letterSpacing: "-0.02em" }],
        "5xl": ["3.25rem", { lineHeight: "3.4rem", letterSpacing: "-0.025em" }],
        "6xl": ["4.25rem", { lineHeight: "4.3rem", letterSpacing: "-0.03em" }],
        "7xl": ["5.5rem", { lineHeight: "5.4rem", letterSpacing: "-0.035em" }],
      },
      letterSpacing: {
        tightest: "-0.04em",
        eyebrow: "0.18em", // for small uppercase labels / eyebrows
      },
      borderRadius: {
        // Architectural: low radii read more premium than rounded-2xl everywhere.
        none: "0",
        xs: "0.125rem",
        sm: "0.1875rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },
      boxShadow: {
        // Soft, warm-tinted elevation rather than hard gray drop-shadows.
        subtle: "0 1px 2px rgba(17,17,17,0.04), 0 1px 3px rgba(17,17,17,0.06)",
        card: "0 2px 8px rgba(17,17,17,0.06), 0 8px 24px rgba(17,17,17,0.05)",
        lift: "0 10px 30px rgba(17,17,17,0.10), 0 4px 8px rgba(17,17,17,0.05)",
        focus: "0 0 0 3px rgba(201,162,39,0.35)",
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
        lux: "cubic-bezier(0.22, 1, 0.36, 1)", // smooth, premium ease-out
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
