import type { EdgeTypes } from "@xyflow/react";
import { ActiveEdge } from "./active-edge";
import { ErrorEdge } from "./error-edge";
import { IdleEdge } from "./idle-edge";

export const edgeTypes = {
  active: ActiveEdge,
  idle: IdleEdge,
  error: ErrorEdge,
} as EdgeTypes;
