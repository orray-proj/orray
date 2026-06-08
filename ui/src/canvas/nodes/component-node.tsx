import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import type {
  ComponentKind,
  ComponentNode as ComponentNodeType,
  HealthStatus,
} from "@/canvas/types";
import { cn } from "@/lib/utils";
import { useCanvasStore } from "@/stores/canvas-store";
import { InlineRename } from "./inline-rename";

const KIND_LABELS: Record<ComponentKind, string> = {
  service: "svc",
  web: "web",
  gateway: "gw",
  job: "job",
  pipeline: "pipe",
};

function healthColor(status: HealthStatus) {
  return `var(--orray-health-${status})`;
}

export function ComponentNode({
  data,
  id,
  selected,
}: NodeProps<ComponentNodeType>) {
  const activeLayerId = useCanvasStore((s) => s.activeLayerId);
  const isRenaming = useCanvasStore((s) => s.renamingNodeId === id);

  const hasProjection = activeLayerId ? activeLayerId in data.layers : true;
  const projection =
    data.layers[activeLayerId ?? ""] ?? Object.values(data.layers)[0];

  const replicas = projection?.labels?.replicas;
  const version = projection?.labels?.version;

  return (
    <div
      className={cn(
        "orray-node orray-node--component",
        selected && "orray-node--selected",
        !hasProjection && "orray-node--dimmed"
      )}
    >
      <Handle className="orray-handle" position={Position.Top} type="target" />

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="orray-node__kind">{KIND_LABELS[data.kind]}</span>
          {isRenaming ? (
            <InlineRename name={data.name} nodeId={id} />
          ) : (
            <span className="orray-node__label">{data.name}</span>
          )}
          {data.origin === "inferred" && (
            <span className="orray-badge--inferred">inferred</span>
          )}
        </div>
        {projection && (
          <span
            className="orray-health-dot"
            style={{ backgroundColor: healthColor(projection.health) }}
          />
        )}
      </div>

      {projection && (
        <div className="orray-node__meta">
          <span>{projection.namespace}</span>
          {version && <span>{version}</span>}
          {!version && replicas && <span>{replicas}r</span>}
        </div>
      )}

      <Handle
        className="orray-handle"
        position={Position.Bottom}
        type="source"
      />
    </div>
  );
}
