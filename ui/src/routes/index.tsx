import { createRoute, Navigate } from "@tanstack/react-router";
import { routeTree } from "./__root";

export const indexRoute = createRoute({
  getParentRoute: () => routeTree,
  path: "/",
  component: () => (
    <Navigate params={{ canvasId: "default" }} to="/canvas/$canvasId" />
  ),
});
