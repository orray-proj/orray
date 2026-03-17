import type { EdgeProps } from "@xyflow/react";
import {
  BaseEdge,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
} from "@xyflow/react";
import type { CanvasEdge } from "@/canvas/types";
import { usePresetStore } from "@/stores/preset-store";

export function ActiveEdge(props: EdgeProps<CanvasEdge>) {
  const preset = usePresetStore((s) => s.getActivePreset());
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

  return (
    <>
      <BaseEdge
        id={props.id}
        path={edgePath}
        style={{
          stroke: preset.edge.colors.active,
          strokeWidth: preset.edge.strokeWidth,
        }}
      />
      {props.data?.protocol && (
        <text
          className="orray-edge-label"
          dominantBaseline="central"
          textAnchor="middle"
          x={labelX}
          y={labelY}
        >
          {props.data.protocol}
        </text>
      )}
    </>
  );
}
