import { Check, LayoutGridIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useListCanvasesV1alpha1 } from "@/generated/api";
import { useProjectStore } from "@/stores/project-store";

export function ProjectSelector() {
  const { data: response, error, isError, isLoading } = useListCanvasesV1alpha1();
  const currentProjectId = useProjectStore((s) => s.currentProjectId);
  const setCurrentProjectId = useProjectStore((s) => s.setCurrentProjectId);

  if (isError) {
    return (
      <div className="p-2 text-center text-muted-foreground text-xs">
        {error.message}
      </div>
    )
  }

  if (response?.status == 400 || response?.status == 500) {
    const errorMessage = response.data.message;
    return (
      <div className="p-2 text-center text-muted-foreground text-xs">
        {errorMessage}
      </div>
    )
  }

  const projects = response?.data.items ?? [];
  const currentProject = projects.find((p) => p.id === currentProjectId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="flex items-center gap-2 border-none bg-accent/30 px-3 font-medium text-xs hover:bg-accent/50"
          size="sm"
          variant="outline"
        >
          <LayoutGridIcon className="h-3.5 w-3.5" />
          <span className="max-w-37.5 truncate">
            {currentProject
              ? currentProject.displayName || currentProject.name
              : "Select project"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-50">
        <DropdownMenuLabel className="flex items-center justify-between font-normal text-muted-foreground text-xs">
          Projects
          <button
            className="text-[10px] hover:text-foreground hover:underline"
            onClick={() => setCurrentProjectId(null)}
          >
            Clear selection
          </button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex cursor-pointer items-center gap-2"
          onClick={() => setCurrentProjectId(null)}
        >
          <div className="flex h-4 w-4 items-center justify-center rounded bg-accent">
            <LayoutGridIcon className="h-3 w-3" />
          </div>
          <span className="text-xs">All Projects</span>
          {!currentProjectId && (
            <Check className="ml-auto h-3.5 w-3.5 text-primary" />
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {isLoading ? (
          <div className="p-2 text-center text-muted-foreground text-xs">
            Loading...
          </div>
        ) : projects.length === 0 ? (
          <div className="p-2 text-center text-muted-foreground text-xs">
            No projects found
          </div>
        ) : (
          projects.map((project) => (
            <DropdownMenuItem
              className="flex cursor-pointer items-center justify-between"
              key={project.id}
              onClick={() => setCurrentProjectId(project.id)}
            >
              <div className="flex flex-col">
                <span className="font-medium text-xs">
                  {project.displayName || project.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {project.id}
                </span>
              </div>
              {project.id === currentProjectId && (
                <Check className="ml-2 h-3.5 w-3.5 text-primary" />
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
