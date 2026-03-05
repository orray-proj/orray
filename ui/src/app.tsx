import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routes/__root";
import { indexRoute } from "./routes/index";

const router = createRouter({
  routeTree: routeTree.addChildren([indexRoute]),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  return <RouterProvider router={router} />;
}
