import type { EdgeProps } from "@xyflow/react";
import {
  BaseEdge,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
} from "@xyflow/react";
import type { CanvasEdge } from "@/canvas/types";
import { usePresetStore } from "@/stores/preset-store";

export function IdleEdge(props: EdgeProps<CanvasEdge>) {
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

  switch (preset.edge.type) {
    case "smoothstep": {
      [edgePath] = getSmoothStepPath(pathParams);
      break;
    }
    case "straight": {
      [edgePath] = getStraightPath(pathParams);
      break;
    }
    case "step": {
      [edgePath] = getSmoothStepPath({ ...pathParams, borderRadius: 0 });
      break;
    }
    default: {
      [edgePath] = getBezierPath(pathParams);
    }
  }

  return (
    <BaseEdge
      id={props.id}
      path={edgePath}
      style={{
        stroke: preset.edge.colors.idle,
        strokeWidth: preset.edge.strokeWidth,
        strokeDasharray: preset.edge.idleDashArray,
      }}
    />
  );
}
