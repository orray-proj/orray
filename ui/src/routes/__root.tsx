import { createRootRoute, Outlet } from "@tanstack/react-router";
import { SettingsButton } from "@/canvas/panels/settings-panel";
import { useInjectPreset } from "@/canvas/use-inject-preset";
import "@/styles/canvas.css";

export const routeTree = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  useInjectPreset();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background text-foreground">
      <Outlet />
      <SettingsButton />
    </div>
  );
}
