import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import type {
  HealthStatus,
  ResourceKind,
  ResourceNode as ResourceNodeType,
} from "@/canvas/types";
import { cn } from "@/lib/utils";
import { useCanvasStore } from "@/stores/canvas-store";
import { InlineRename } from "./inline-rename";

const KIND_LABELS: Record<ResourceKind, string> = {
  database: "db",
  cache: "cache",
  queue: "queue",
  storage: "store",
  external: "ext",
};

function healthColor(status: HealthStatus) {
  return `var(--orray-health-${status})`;
}

export function ResourceNode({
  data,
  id,
  selected,
}: NodeProps<ResourceNodeType>) {
  const activeLayerId = useCanvasStore((s) => s.activeLayerId);
  const isRenaming = useCanvasStore((s) => s.renamingNodeId === id);

  const hasProjection = activeLayerId ? activeLayerId in data.layers : true;
  const projection =
    data.layers[activeLayerId ?? ""] ?? Object.values(data.layers)[0];

  const provider = projection?.labels?.provider;

  return (
    <div
      className={cn(
        "orray-node orray-node--resource",
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

      {provider && (
        <div className="orray-node__meta">
          <span>{provider}</span>
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
