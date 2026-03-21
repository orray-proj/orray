import { create } from "zustand";
import { persist } from "zustand/middleware";
import { builtinPresets, defaultLightPreset } from "@/canvas/presets";
import type { ThemePreset } from "@/canvas/types";

interface PresetState {
  activePresetId: string;
  getActivePreset: () => ThemePreset;
  presets: ThemePreset[];
  setActivePreset: (id: string) => void;
}

export const usePresetStore = create<PresetState>()(
  persist(
    (set, get) => ({
      activePresetId: defaultLightPreset.id,
      presets: builtinPresets,

      setActivePreset: (id: string) => {
        const exists = get().presets.some((p) => p.id === id);
        if (exists) {
          set({ activePresetId: id });
        }
      },

      getActivePreset: () => {
        const { presets, activePresetId } = get();
        return (
          presets.find((p) => p.id === activePresetId) ?? defaultLightPreset
        );
      },
    }),
    {
      name: "orray-preset",
      partialize: (state) => ({ activePresetId: state.activePresetId }),
    }
  )
);
