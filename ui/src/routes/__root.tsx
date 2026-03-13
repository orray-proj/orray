import { createRootRoute, Outlet } from "@tanstack/react-router";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";

export const routeTree = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-end gap-1 p-2">
        <LanguageSelector />
        <ThemeToggle />
      </header>
      <Outlet />
    </div>
  );
}
