// @hudsten/ui — design tokens (TS mirror of the Tailwind preset) for non-CSS consumers,
// e.g. theme-color meta tags, OG image generation, chart colors.

export const brandColors = {
  ink: "#171717",
  paper: "#FFFFFF",
  brass: "#171717", // neutralized to monochrome (MW has no metallic accent)
  whatsapp: "#1E7A47", // refined green reserved for the primary CTA
} as const;

export const fontStacks = {
  display: "Inter, ui-sans-serif, system-ui, sans-serif",
  sans: "Inter, ui-sans-serif, system-ui, sans-serif",
} as const;

export type BrandColor = keyof typeof brandColors;
