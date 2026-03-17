import { PaletteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePresetStore } from "@/stores/preset-store";

export function PresetSelector() {
  const presets = usePresetStore((s) => s.presets);
  const activePresetId = usePresetStore((s) => s.activePresetId);
  const setActivePreset = usePresetStore((s) => s.setActivePreset);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <PaletteIcon className="h-4 w-4" />
          <span className="sr-only">Theme preset</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {presets.map((preset) => (
          <DropdownMenuItem
            key={preset.id}
            onClick={() => setActivePreset(preset.id)}
          >
            <span
              className="mr-2 inline-block h-3 w-3 rounded-full border"
              style={{
                backgroundColor: preset.canvas.background,
                borderColor: preset.node.border,
              }}
            />
            {preset.name}
            {preset.id === activePresetId && (
              <span className="ml-auto text-xs opacity-50">active</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
