import type { EdgeProps } from "@xyflow/react";
import {
  BaseEdge,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
} from "@xyflow/react";
import type { CanvasEdge } from "@/canvas/types";
import { useActiveVariant } from "@/canvas/use-active-variant";
import { useCanvasStore } from "@/stores/canvas-store";

export function DependencyEdge(props: EdgeProps<CanvasEdge>) {
  const preset = useActiveVariant();
  const activeLayerId = useCanvasStore((s) => s.activeLayerId);
  const pathParams = {
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  };

  let edgePath: string;
  let labelX: number;
  let labelY: number;

  switch (preset.edge.type) {
    case "smoothstep": {
      const [path, lx, ly] = getSmoothStepPath(pathParams);
      edgePath = path;
      labelX = lx;
      labelY = ly;
      break;
    }
    case "straight": {
      const [path, lx, ly] = getStraightPath(pathParams);
      edgePath = path;
      labelX = lx;
      labelY = ly;
      break;
    }
    case "step": {
      const [path, lx, ly] = getSmoothStepPath({
        ...pathParams,
        borderRadius: 0,
      });
      edgePath = path;
      labelX = lx;
      labelY = ly;
      break;
    }
    default: {
      const [path, lx, ly] = getBezierPath(pathParams);
      edgePath = path;
      labelX = lx;
      labelY = ly;
    }
  }

  const layers = props.data?.layers;
  const hasProjection = activeLayerId ? Boolean(layers?.[activeLayerId]) : true;
  const fallbackKey = Object.keys(layers ?? {})[0] ?? "";
  const projection = layers?.[activeLayerId ?? fallbackKey];

  return (
    <g className={hasProjection ? undefined : "orray-edge--dimmed"}>
      <BaseEdge
        id={props.id}
        path={edgePath}
        style={{
          stroke: preset.edge.colors.dependency,
          strokeWidth: preset.edge.strokeWidth,
          strokeDasharray: preset.edge.dependencyDashArray,
        }}
      />
      {projection?.protocol && (
        <text
          className="orray-edge-label orray-edge-label--subtle"
          dominantBaseline="central"
          textAnchor="middle"
          x={labelX}
          y={labelY}
        >
          {projection.protocol}
        </text>
      )}
    </g>
  );
}
