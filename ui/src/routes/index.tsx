import { useQueryClient } from "@tanstack/react-query";
import { createRoute } from "@tanstack/react-router";
import {
  FolderIcon,
  LayoutGridIcon,
  Loader2Icon,
  PlusIcon,
} from "lucide-react";
import { Canvas } from "@/canvas/canvas";
import { Button } from "@/components/ui/button";
import {
  getListCanvasesV1alpha1QueryKey,
  useCreateCanvasV1alpha1,
  useListCanvasesV1alpha1,
} from "@/generated/api";
import { useProjectStore } from "@/stores/project-store";
import { routeTree } from "./__root";

export const indexRoute = createRoute({
  getParentRoute: () => routeTree,
  path: "/",
  component: IndexPage,
});

function IndexPage() {
  const currentProjectId = useProjectStore((s) => s.currentProjectId);
  const setCurrentProjectId = useProjectStore((s) => s.setCurrentProjectId);
  const { data: response, isLoading } = useListCanvasesV1alpha1();
  const queryClient = useQueryClient();
  const createMutation = useCreateCanvasV1alpha1();

  const projects = response?.data?.items || [];

  const handleCreateProject = () => {
    const name = window.prompt("Enter project name:");
    if (!name) {
      return;
    }

    createMutation.mutate(
      {
        data: {
          displayName: name,
          name: name.toLowerCase().replace(/ /g, "-"),
        },
      },
      {
        onSuccess: (newResponse) => {
          queryClient.invalidateQueries({
            queryKey: getListCanvasesV1alpha1QueryKey(),
          });
          if ("data" in newResponse && newResponse.data) {
            setCurrentProjectId(newResponse.data.id);
          }
        },
      }
    );
  };

  if (currentProjectId) {
    return (
      <div className="relative h-[calc(100vh-3rem)] w-full">
        <Canvas />
        <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex items-center gap-2 rounded-lg border border-border/50 bg-background/80 p-2 text-[10px] text-muted-foreground shadow-sm backdrop-blur">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          Project:{" "}
          {projects.find((p) => p.id === currentProjectId)?.displayName ||
            currentProjectId}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] w-full flex-col items-center justify-center bg-muted/20 p-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-2xl tracking-tight">
              Select a Project
            </h1>
            <p className="text-muted-foreground">
              Choose a canvas to start visualizing your infrastructure.
            </p>
          </div>
          <Button
            className="gap-2"
            disabled={createMutation.isPending}
            onClick={handleCreateProject}
          >
            {createMutation.isPending ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <PlusIcon className="h-4 w-4" />
            )}
            New Project
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                className="h-32 animate-pulse rounded-xl border border-border/50 bg-accent/50"
                key={i}
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-border/50 border-dashed bg-background/50 p-8 text-center">
            <FolderIcon className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <h3 className="font-medium text-lg">No projects found</h3>
            <p className="mt-1 max-w-xs text-muted-foreground text-sm">
              Create your first project to start mapping your Kubernetes
              resources.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <button
                className="group flex flex-col items-start rounded-xl border border-border/50 bg-background p-5 text-left shadow-sm transition-all hover:border-primary/30 hover:bg-accent/50 hover:shadow-md"
                key={project.id}
                onClick={() => setCurrentProjectId(project.id)}
              >
                <div className="mb-4 rounded-lg bg-primary/10 p-2 text-primary transition-transform group-hover:scale-110">
                  <LayoutGridIcon className="h-5 w-5" />
                </div>
                <h3 className="w-full truncate font-semibold text-sm">
                  {project.displayName || project.name}
                </h3>
                <span className="mt-1 font-mono text-[10px] text-muted-foreground">
                  {project.id}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
