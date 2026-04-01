import { create } from "zustand";
import { persist } from "zustand/middleware";
import { builtinThemes, defaultTheme } from "@/canvas/presets";
import type { CanvasTheme, ThemeVariant } from "@/canvas/types";

interface PresetState {
  activeThemeId: string;
  getActiveTheme: () => CanvasTheme;
  getVariant: (colorMode: "light" | "dark") => ThemeVariant;
  setActiveTheme: (id: string) => void;
  themes: CanvasTheme[];
}

export const usePresetStore = create<PresetState>()(
  persist(
    (set, get) => ({
      activeThemeId: defaultTheme.id,
      themes: builtinThemes,

      setActiveTheme: (id: string) => {
        const exists = get().themes.some((t) => t.id === id);
        if (exists) {
          set({ activeThemeId: id });
        }
      },

      getActiveTheme: () => {
        const { themes, activeThemeId } = get();
        return themes.find((t) => t.id === activeThemeId) ?? defaultTheme;
      },

      getVariant: (colorMode: "light" | "dark") => {
        const theme = get().getActiveTheme();
        return theme[colorMode];
      },
    }),
    {
      name: "orray-preset",
      partialize: (state) => ({ activeThemeId: state.activeThemeId }),
    }
  )
);
