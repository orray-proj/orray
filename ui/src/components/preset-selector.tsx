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
  const themes = usePresetStore((s) => s.themes);
  const activeThemeId = usePresetStore((s) => s.activeThemeId);
  const setActiveTheme = usePresetStore((s) => s.setActiveTheme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <PaletteIcon className="h-4 w-4" />
          <span className="sr-only">Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => setActiveTheme(theme.id)}
          >
            <span
              className="mr-2 inline-block h-3 w-3 rounded-full border"
              style={{
                backgroundColor: theme.dark.canvas.background,
                borderColor: theme.dark.node.border,
              }}
            />
            {theme.name}
            {theme.id === activeThemeId && (
              <span className="ml-auto text-xs opacity-50">active</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
