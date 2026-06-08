// @hudsten/ui — design tokens (TS mirror of the Tailwind preset) for non-CSS consumers,
// e.g. theme-color meta tags, OG image generation, chart colors.

export const brandColors = {
  ink: "#111111",
  paper: "#FAFAF7",
  brass: "#C9A227",
  whatsapp: "#25D366",
} as const;

export const fontStacks = {
  display: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif",
  sans: "Inter, ui-sans-serif, system-ui, sans-serif",
} as const;

export type BrandColor = keyof typeof brandColors;
