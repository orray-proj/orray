import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import type {
  ComponentNode as ComponentNodeType,
  HealthStatus,
} from "@/canvas/types";
import { cn } from "@/lib/utils";

const KIND_LABELS: Record<ComponentNodeType["data"]["kind"], string> = {
  Deployment: "deploy",
  StatefulSet: "sts",
  DaemonSet: "ds",
  Job: "job",
  CronJob: "cron",
};

function healthColor(status: HealthStatus) {
  return `var(--orray-health-${status})`;
}

export function ComponentNode({
  data,
  selected,
}: NodeProps<ComponentNodeType>) {
  const { ready, desired } = data.replicas;

  return (
    <div
      className={cn(
        "orray-node orray-node--component",
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

      <div className="orray-node__meta">
        <span>{data.namespace}</span>
        <span>
          {ready}/{desired}
        </span>
      </div>

      <Handle
        className="orray-handle"
        position={Position.Bottom}
        type="source"
      />
    </div>
  );
}
