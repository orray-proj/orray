import { useEffect } from "react";
import { usePresetStore } from "@/stores/preset-store";

const STYLE_ID = "orray-preset-vars";

function injectVars(
  el: HTMLStyleElement,
  preset: ReturnType<typeof usePresetStore.getState>["presets"][number]
) {
  el.textContent = `:root {
  --orray-canvas-bg: ${preset.canvas.background};
  --orray-canvas-dot-color: ${preset.canvas.dotColor};
  --orray-canvas-dot-size: ${preset.canvas.dotSize};
  --orray-node-bg: ${preset.node.background};
  --orray-node-fg: ${preset.node.foreground};
  --orray-node-border: ${preset.node.border};
  --orray-node-radius: ${preset.node.borderRadius};
  --orray-node-shadow: ${preset.node.shadow};
  --orray-health-healthy: ${preset.health.healthy};
  --orray-health-degraded: ${preset.health.degraded};
  --orray-health-unhealthy: ${preset.health.unhealthy};
  --orray-health-unknown: ${preset.health.unknown};
  --orray-selection-bg: ${preset.selection.background};
  --orray-selection-border: ${preset.selection.border};
  --orray-font-family: ${preset.typography.fontFamily};
  --orray-node-label-size: ${preset.typography.nodeLabelSize};
  --orray-minimap-bg: ${preset.minimap.background};
  --orray-minimap-node: ${preset.minimap.nodeColor};
  --orray-minimap-mask-opacity: ${preset.minimap.maskOpacity};
}`;
}

export function useInjectPreset() {
  const getActivePreset = usePresetStore((s) => s.getActivePreset);
  const activePresetId = usePresetStore((s) => s.activePresetId);

  // biome-ignore lint/correctness/useExhaustiveDependencies: activePresetId triggers re-injection when the user switches presets
  useEffect(() => {
    let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }

    const preset = getActivePreset();
    if (!preset) {
      return;
    }

    injectVars(style, preset);
  }, [activePresetId, getActivePreset]);
}
