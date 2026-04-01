import { createRoute, Navigate, useParams } from "@tanstack/react-router";
import { Canvas } from "@/canvas/canvas";
import { useCanvasStore } from "@/stores/canvas-store";
import { routeTree } from "./__root";

export const canvasRoute = createRoute({
  getParentRoute: () => routeTree,
  path: "/canvas/$canvasId",
  component: CanvasPage,
});

function CanvasPage() {
  const phase = useCanvasStore((s) => s.phase);
  const { canvasId } = useParams({ from: "/canvas/$canvasId" });

  if (phase === "layer-setup") {
    return <Navigate params={{ canvasId }} to="/canvas/$canvasId/layers" />;
  }

  return (
    <div className="h-full w-full">
      <Canvas />
    </div>
  );
}
