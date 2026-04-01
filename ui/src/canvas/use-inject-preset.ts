import { useEffect } from "react";
import { useTheme } from "@/lib/theme";
import { usePresetStore } from "@/stores/preset-store";
import type { ThemeVariant } from "./types";

const STYLE_ID = "orray-preset-vars";

function injectVars(el: HTMLStyleElement, v: ThemeVariant) {
  el.textContent = `:root {
  --orray-canvas-bg: ${v.canvas.background};
  --orray-canvas-dot-color: ${v.canvas.dotColor};
  --orray-canvas-dot-size: ${v.canvas.dotSize};
  --orray-node-bg: ${v.node.background};
  --orray-node-fg: ${v.node.foreground};
  --orray-node-border: ${v.node.border};
  --orray-node-radius: ${v.node.borderRadius};
  --orray-node-shadow: ${v.node.shadow};
  --orray-health-healthy: ${v.health.healthy};
  --orray-health-degraded: ${v.health.degraded};
  --orray-health-critical: ${v.health.critical};
  --orray-health-unknown: ${v.health.unknown};
  --orray-selection-bg: ${v.selection.background};
  --orray-selection-border: ${v.selection.border};
  --orray-font-family: ${v.typography.fontFamily};
  --orray-node-label-size: ${v.typography.nodeLabelSize};
  --orray-minimap-bg: ${v.minimap.background};
  --orray-minimap-node: ${v.minimap.nodeColor};
  --orray-minimap-mask-opacity: ${v.minimap.maskOpacity};
}`;
}

export function useInjectPreset() {
  const { resolvedTheme } = useTheme();
  const getVariant = usePresetStore((s) => s.getVariant);
  const activeThemeId = usePresetStore((s) => s.activeThemeId);

  // biome-ignore lint/correctness/useExhaustiveDependencies: activeThemeId and resolvedTheme trigger re-injection
  useEffect(() => {
    let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }

    injectVars(style, getVariant(resolvedTheme));
  }, [activeThemeId, resolvedTheme, getVariant]);
}
