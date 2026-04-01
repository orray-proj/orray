import { createRoute, useNavigate } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCanvasStore } from "@/stores/canvas-store";
import { routeTree } from "./__root";

export const canvasLayersRoute = createRoute({
  getParentRoute: () => routeTree,
  path: "/canvas/$canvasId/layers",
  component: CanvasLayersPage,
});

function CanvasLayersPage() {
  const navigate = useNavigate();
  const setPhase = useCanvasStore((s) => s.setPhase);

  function handleContinue() {
    setPhase("reviewing");
    navigate({ to: "/canvas/$canvasId", params: { canvasId: "default" } });
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <h1 className="font-semibold text-2xl">Layer Setup</h1>
      <p className="max-w-md text-center text-sm opacity-60">
        Organize your namespaces into layers. Drag namespaces between layers to
        group environments (e.g., production, staging). You can always change
        this later.
      </p>

      {/* TODO: namespace drag-and-drop UI */}
      <div className="rounded-lg border border-current/20 border-dashed p-12 opacity-40">
        Namespace drag-and-drop area (mocked)
      </div>

      <button
        className="rounded-md bg-foreground px-6 py-2 font-medium text-background text-sm transition-opacity hover:opacity-80"
        onClick={handleContinue}
        type="button"
      >
        Discover with defaults
      </button>
    </div>
  );
}
