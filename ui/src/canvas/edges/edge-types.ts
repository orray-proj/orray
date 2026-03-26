import type { EdgeTypes } from "@xyflow/react";
import { ApiEdge } from "./api-edge";
import { DependencyEdge } from "./dependency-edge";
import { EventEdge } from "./event-edge";

export const edgeTypes = {
  api: ApiEdge,
  dependency: DependencyEdge,
  event: EventEdge,
} as EdgeTypes;
