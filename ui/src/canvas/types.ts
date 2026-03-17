import type { Edge, Node } from "@xyflow/react";

export type HealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";

// --- Node data payloads ---
// biome-ignore lint/style/useConsistentTypeDefinitions: ReactFlow's Node generic requires Record<string, unknown>, and only type aliases (not interfaces) have implicit index signatures in TypeScript.
export type ComponentData = {
  label: string;
  kind: "Deployment" | "StatefulSet" | "DaemonSet" | "Job" | "CronJob";
  namespace: string;
  replicas: { ready: number; desired: number };
  health: HealthStatus;
};

// biome-ignore lint/style/useConsistentTypeDefinitions: same as above — ReactFlow constraint
export type ResourceData = {
  label: string;
  kind: "Database" | "Cache" | "Queue" | "Storage" | "ExternalService";
  provider?: string;
  health: HealthStatus;
};

export type ComponentNode = Node<ComponentData, "component">;
export type ResourceNode = Node<ResourceData, "resource">;
export type CanvasNode = ComponentNode | ResourceNode;

// --- Edge data payloads ---

// biome-ignore lint/style/useConsistentTypeDefinitions: same as above — ReactFlow constraint
export type TrafficData = {
  protocol?: string;
  rps?: number;
  latencyP99?: number;
  errorRate?: number;
  status: EdgeStatus;
};

export type EdgeStatus = "active" | "idle" | "error";

export type CanvasEdge = Edge<TrafficData>;

// --- Theme preset ---

export type EdgeType = "bezier" | "smoothstep" | "step" | "straight";

// biome-ignore lint/style/useConsistentTypeDefinitions: consistent with the other data types in this file
export type EdgeStylePreset = {
  type: EdgeType;
  strokeWidth: number;
  animated: boolean;
  colors: { active: string; idle: string; error: string };
  idleDashArray: string;
};

// biome-ignore lint/style/useConsistentTypeDefinitions: consistent with the other data types in this file
export type ThemePreset = {
  id: string;
  name: string;
  colorMode: "light" | "dark";
  canvas: { background: string; dotColor: string; dotSize: number };
  node: {
    background: string;
    foreground: string;
    border: string;
    borderRadius: string;
    shadow: string;
  };
  health: {
    healthy: string;
    degraded: string;
    unhealthy: string;
    unknown: string;
  };
  edge: EdgeStylePreset;
  selection: { background: string; border: string };
  typography: { fontFamily: string; nodeLabelSize: string };
  minimap: { background: string; nodeColor: string; maskOpacity: number };
};
