import { createRootRoute, Outlet } from "@tanstack/react-router";
import { LanguageSelector } from "@/components/language-selector";
import { PresetSelector } from "@/components/preset-selector";
import { ProjectSelector } from "@/components/project-selector";
import { ThemeToggle } from "@/components/theme-toggle";

export const routeTree = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between gap-1 border-border/50 border-b p-2">
        <div className="flex items-center gap-2">
          <ProjectSelector />
        </div>
        <div className="flex items-center gap-1">
          <LanguageSelector />
          <PresetSelector />
          <ThemeToggle />
        </div>
      </header>
      <Outlet />
    </div>
  );
}
