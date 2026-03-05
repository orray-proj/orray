import { createRoute } from "@tanstack/react-router";
import { routeTree } from "./__root";

export const indexRoute = createRoute({
  getParentRoute: () => routeTree,
  path: "/",
  component: IndexPage,
});

function IndexPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="font-bold text-4xl tracking-tight">Orray</h1>
        <p className="mt-2 text-muted-foreground">Spatial Platform Interface</p>
      </div>
    </div>
  );
}
