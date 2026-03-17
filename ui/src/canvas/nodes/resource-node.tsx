import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import type {
  HealthStatus,
  ResourceNode as ResourceNodeType,
} from "@/canvas/types";
import { cn } from "@/lib/utils";

const KIND_LABELS: Record<ResourceNodeType["data"]["kind"], string> = {
  Database: "db",
  Cache: "cache",
  Queue: "queue",
  Storage: "store",
  ExternalService: "ext",
};

function healthColor(status: HealthStatus) {
  return `var(--orray-health-${status})`;
}

export function ResourceNode({ data, selected }: NodeProps<ResourceNodeType>) {
  return (
    <div
      className={cn(
        "orray-node orray-node--resource",
        selected && "orray-node--selected"
      )}
    >
      <Handle className="orray-handle" position={Position.Top} type="target" />

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="orray-node__kind">{KIND_LABELS[data.kind]}</span>
          <span className="orray-node__label">{data.label}</span>
        </div>
        <span
          className="orray-health-dot"
          style={{ backgroundColor: healthColor(data.health) }}
        />
      </div>

      {data.provider && (
        <div className="orray-node__meta">
          <span>{data.provider}</span>
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
