// @hudsten/ui — design tokens (TS mirror of the Tailwind preset) for non-CSS consumers,
// e.g. theme-color meta tags, OG image generation, chart colors.

export const brandColors = {
  ink: "#1C1C1C",
  paper: "#FFFFFF",
  brass: "#171717", // neutralized to monochrome (MW has no metallic accent)
  whatsapp: "#16A34A", // clean modern green for the primary CTA
} as const;

export const fontStacks = {
  display: "Instrument Sans, ui-sans-serif, system-ui, sans-serif",
  sans: "Instrument Sans, ui-sans-serif, system-ui, sans-serif",
} as const;

export type BrandColor = keyof typeof brandColors;
