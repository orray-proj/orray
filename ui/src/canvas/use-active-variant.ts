import { useTheme } from "@/lib/theme";
import { usePresetStore } from "@/stores/preset-store";
import type { ThemeVariant } from "./types";

export function useActiveVariant(): ThemeVariant {
  const { resolvedTheme } = useTheme();
  return usePresetStore((s) => s.getVariant(resolvedTheme));
}
