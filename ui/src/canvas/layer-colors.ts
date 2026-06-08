/**
 * Shared oklch color palette for layers.
 *
 * Used by:
 * - Layer setup page (color assignment on creation)
 * - Mock data (MOCK_LAYERS)
 * - Layer switcher (color dots, glow, edge-light)
 *
 * All values use oklch to stay consistent with the theme system.
 * See ui/CLAUDE.md — "Colors are oklch."
 */
export const LAYER_COLORS = [
  "oklch(0.62 0.19 260)", // indigo
  "oklch(0.75 0.18 75)", // amber
  "oklch(0.72 0.19 165)", // emerald
  "oklch(0.63 0.24 27)", // red
  "oklch(0.65 0.2 295)", // violet
  "oklch(0.68 0.22 340)", // pink
  "oklch(0.72 0.15 200)", // cyan
  "oklch(0.72 0.18 50)", // orange
] as const;

export type LayerColor = (typeof LAYER_COLORS)[number];
