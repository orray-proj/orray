import type { CanvasTheme, ThemeVariant } from "./types";

const defaultLight: ThemeVariant = {
  canvas: {
    background: "oklch(0.985 0 0)",
    dotColor: "oklch(0.87 0 0)",
    dotSize: 1,
  },
  node: {
    background: "oklch(1 0 0)",
    foreground: "oklch(0.145 0 0)",
    border: "oklch(0.922 0 0)",
    borderRadius: "0.5rem",
    shadow: "0 1px 3px oklch(0 0 0 / 0.08)",
  },
  health: {
    healthy: "oklch(0.72 0.19 145)",
    degraded: "oklch(0.75 0.18 75)",
    critical: "oklch(0.63 0.24 27)",
    unknown: "oklch(0.7 0 0)",
  },
  edge: {
    type: "bezier",
    strokeWidth: 1.5,
    animated: false,
    colors: {
      api: "oklch(0.7 0 0)",
      dependency: "oklch(0.82 0 0)",
      event: "oklch(0.65 0.08 250)",
    },
    dependencyDashArray: "4 4",
    eventDashArray: "8 4",
  },
  selection: {
    background: "oklch(0.88 0.05 250 / 0.15)",
    border: "oklch(0.6 0.15 250)",
  },
  typography: { fontFamily: "system-ui, sans-serif", nodeLabelSize: "13px" },
  minimap: {
    background: "oklch(0.97 0 0)",
    nodeColor: "oklch(0.85 0 0)",
    maskOpacity: 0.08,
  },
};

const defaultDark: ThemeVariant = {
  canvas: {
    background: "oklch(0.145 0 0)",
    dotColor: "oklch(0.25 0 0)",
    dotSize: 1,
  },
  node: {
    background: "oklch(0.2 0 0)",
    foreground: "oklch(0.93 0 0)",
    border: "oklch(0.3 0 0)",
    borderRadius: "0.5rem",
    shadow: "0 1px 3px oklch(0 0 0 / 0.3)",
  },
  health: {
    healthy: "oklch(0.72 0.19 145)",
    degraded: "oklch(0.75 0.18 75)",
    critical: "oklch(0.63 0.24 27)",
    unknown: "oklch(0.5 0 0)",
  },
  edge: {
    type: "bezier",
    strokeWidth: 1.5,
    animated: false,
    colors: {
      api: "oklch(0.5 0 0)",
      dependency: "oklch(0.35 0 0)",
      event: "oklch(0.45 0.08 250)",
    },
    dependencyDashArray: "4 4",
    eventDashArray: "8 4",
  },
  selection: {
    background: "oklch(0.5 0.1 250 / 0.2)",
    border: "oklch(0.6 0.15 250)",
  },
  typography: { fontFamily: "system-ui, sans-serif", nodeLabelSize: "13px" },
  minimap: {
    background: "oklch(0.18 0 0)",
    nodeColor: "oklch(0.35 0 0)",
    maskOpacity: 0.15,
  },
};

const highContrastLight: ThemeVariant = {
  canvas: {
    background: "oklch(1 0 0)",
    dotColor: "oklch(0.85 0 0)",
    dotSize: 1,
  },
  node: {
    background: "oklch(0.98 0 0)",
    foreground: "oklch(0 0 0)",
    border: "oklch(0.3 0 0)",
    borderRadius: "0.25rem",
    shadow: "none",
  },
  health: {
    healthy: "oklch(0.45 0.25 145)",
    degraded: "oklch(0.55 0.22 85)",
    critical: "oklch(0.5 0.3 27)",
    unknown: "oklch(0.4 0 0)",
  },
  edge: {
    type: "smoothstep",
    strokeWidth: 2.5,
    animated: false,
    colors: {
      api: "oklch(0.15 0 0)",
      dependency: "oklch(0.5 0 0)",
      event: "oklch(0.3 0.12 250)",
    },
    dependencyDashArray: "4 4",
    eventDashArray: "8 4",
  },
  selection: { background: "oklch(0 0 0 / 0.08)", border: "oklch(0 0 0)" },
  typography: { fontFamily: "system-ui, sans-serif", nodeLabelSize: "14px" },
  minimap: {
    background: "oklch(0.95 0 0)",
    nodeColor: "oklch(0.4 0 0)",
    maskOpacity: 0.1,
  },
};

const highContrastDark: ThemeVariant = {
  canvas: {
    background: "oklch(0.05 0 0)",
    dotColor: "oklch(0.25 0 0)",
    dotSize: 1,
  },
  node: {
    background: "oklch(0.12 0 0)",
    foreground: "oklch(1 0 0)",
    border: "oklch(0.8 0 0)",
    borderRadius: "0.25rem",
    shadow: "none",
  },
  health: {
    healthy: "oklch(0.85 0.25 145)",
    degraded: "oklch(0.85 0.22 85)",
    critical: "oklch(0.7 0.3 27)",
    unknown: "oklch(0.6 0 0)",
  },
  edge: {
    type: "smoothstep",
    strokeWidth: 2.5,
    animated: false,
    colors: {
      api: "oklch(0.9 0 0)",
      dependency: "oklch(0.5 0 0)",
      event: "oklch(0.7 0.12 250)",
    },
    dependencyDashArray: "4 4",
    eventDashArray: "8 4",
  },
  selection: { background: "oklch(1 0 0 / 0.12)", border: "oklch(1 0 0)" },
  typography: { fontFamily: "system-ui, sans-serif", nodeLabelSize: "14px" },
  minimap: {
    background: "oklch(0.08 0 0)",
    nodeColor: "oklch(0.6 0 0)",
    maskOpacity: 0.2,
  },
};

const blueprintLight: ThemeVariant = {
  canvas: {
    background: "oklch(0.92 0.02 250)",
    dotColor: "oklch(0.8 0.04 250)",
    dotSize: 1,
  },
  node: {
    background: "oklch(0.95 0.02 250)",
    foreground: "oklch(0.2 0.04 250)",
    border: "oklch(0.6 0.08 250)",
    borderRadius: "0.125rem",
    shadow: "none",
  },
  health: {
    healthy: "oklch(0.55 0.17 170)",
    degraded: "oklch(0.6 0.17 85)",
    critical: "oklch(0.5 0.24 27)",
    unknown: "oklch(0.5 0.04 250)",
  },
  edge: {
    type: "step",
    strokeWidth: 1.5,
    animated: false,
    colors: {
      api: "oklch(0.4 0.08 250)",
      dependency: "oklch(0.65 0.05 250)",
      event: "oklch(0.45 0.1 200)",
    },
    dependencyDashArray: "4 6",
    eventDashArray: "8 4",
  },
  selection: {
    background: "oklch(0.45 0.1 250 / 0.15)",
    border: "oklch(0.4 0.12 250)",
  },
  typography: {
    fontFamily: "'SF Mono', 'Fira Code', ui-monospace, monospace",
    nodeLabelSize: "12px",
  },
  minimap: {
    background: "oklch(0.88 0.02 250)",
    nodeColor: "oklch(0.6 0.06 250)",
    maskOpacity: 0.1,
  },
};

const blueprintDark: ThemeVariant = {
  canvas: {
    background: "oklch(0.22 0.04 250)",
    dotColor: "oklch(0.35 0.05 250)",
    dotSize: 1,
  },
  node: {
    background: "oklch(0.27 0.04 250)",
    foreground: "oklch(0.92 0.02 220)",
    border: "oklch(0.5 0.08 250)",
    borderRadius: "0.125rem",
    shadow: "none",
  },
  health: {
    healthy: "oklch(0.78 0.17 170)",
    degraded: "oklch(0.78 0.17 85)",
    critical: "oklch(0.65 0.24 27)",
    unknown: "oklch(0.5 0.04 250)",
  },
  edge: {
    type: "step",
    strokeWidth: 1.5,
    animated: false,
    colors: {
      api: "oklch(0.6 0.08 250)",
      dependency: "oklch(0.4 0.05 250)",
      event: "oklch(0.55 0.1 200)",
    },
    dependencyDashArray: "4 6",
    eventDashArray: "8 4",
  },
  selection: {
    background: "oklch(0.55 0.1 250 / 0.2)",
    border: "oklch(0.7 0.12 250)",
  },
  typography: {
    fontFamily: "'SF Mono', 'Fira Code', ui-monospace, monospace",
    nodeLabelSize: "12px",
  },
  minimap: {
    background: "oklch(0.18 0.03 250)",
    nodeColor: "oklch(0.45 0.06 250)",
    maskOpacity: 0.15,
  },
};

export const defaultTheme: CanvasTheme = {
  id: "default",
  name: "Default",
  light: defaultLight,
  dark: defaultDark,
};
export const highContrastTheme: CanvasTheme = {
  id: "high-contrast",
  name: "High Contrast",
  light: highContrastLight,
  dark: highContrastDark,
};
export const blueprintTheme: CanvasTheme = {
  id: "blueprint",
  name: "Blueprint",
  light: blueprintLight,
  dark: blueprintDark,
};

export const builtinThemes: CanvasTheme[] = [
  defaultTheme,
  highContrastTheme,
  blueprintTheme,
];
