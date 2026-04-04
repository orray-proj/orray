import { createRoute } from "@tanstack/react-router";
import { Canvas } from "@/canvas/canvas";
import { routeTree } from "./__root";

export const indexRoute = createRoute({
  getParentRoute: () => routeTree,
  path: "/",
  component: IndexPage,
});

function IndexPage() {
  return (
    <div className="h-[calc(100vh-3rem)] w-full">
      <Canvas />
    </div>
  );
}
