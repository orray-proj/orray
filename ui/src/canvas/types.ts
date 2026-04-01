import type { Edge, Node } from "@xyflow/react";

// ---------------------------------------------------------------------------
// Domain types — aligned with the Notion API schema (2026-03-25)
// ---------------------------------------------------------------------------

export type HealthStatus = "healthy" | "degraded" | "critical" | "unknown";

export type ComponentKind = "service" | "web" | "gateway" | "job" | "pipeline";
export type ResourceKind =
  | "database"
  | "queue"
  | "cache"
  | "storage"
  | "external";
export type EdgeKind = "api" | "dependency" | "event";

/** Whether the entity was auto-discovered or manually created/corrected. */
export type NodeOrigin = "inferred" | "user";

// --- Layer projections ---

/** K8s source reference for a node in a specific layer. */
// biome-ignore lint/style/useConsistentTypeDefinitions: ReactFlow's Node generic requires Record<string, unknown>, and only type aliases (not interfaces) have implicit index signatures in TypeScript.
export type KubernetesSource = {
  provider: string;
  apiVersion: string;
  resource: string;
  namespace: string;
  name: string;
  uid: string;
};

/** Per-layer data for a node — varies by environment. */
// biome-ignore lint/style/useConsistentTypeDefinitions: same as above — ReactFlow constraint
export type NodeProjection = {
  namespace: string;
  health: HealthStatus;
  labels: Record<string, string>;
  source: KubernetesSource;
};

/** Per-layer data for an edge — varies by environment. */
// biome-ignore lint/style/useConsistentTypeDefinitions: same as above — ReactFlow constraint
export type EdgeProjection = {
  protocol: string;
  port?: number;
  labels: Record<string, string>;
};

// --- Node data payloads ---

// biome-ignore lint/style/useConsistentTypeDefinitions: same as above — ReactFlow constraint
export type ComponentData = {
  name: string;
  kind: ComponentKind;
  origin: NodeOrigin;
  layers: Record<string, NodeProjection>;
};

// biome-ignore lint/style/useConsistentTypeDefinitions: same as above — ReactFlow constraint
export type ResourceData = {
  name: string;
  kind: ResourceKind;
  origin: NodeOrigin;
  layers: Record<string, NodeProjection>;
};

export type ComponentNode = Node<ComponentData, "component">;
export type ResourceNode = Node<ResourceData, "resource">;
export type CanvasNode = ComponentNode | ResourceNode;

// --- Edge data payload ---

// biome-ignore lint/style/useConsistentTypeDefinitions: same as above — ReactFlow constraint
export type TopologyEdgeData = {
  kind: EdgeKind;
  origin: NodeOrigin;
  layers: Record<string, EdgeProjection>;
};

export type CanvasEdge = Edge<TopologyEdgeData>;

// --- Topology response ---

// biome-ignore lint/style/useConsistentTypeDefinitions: same as above — ReactFlow constraint
export type Topology = {
  resourceVersion: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
};

// --- Theme preset ---

export type EdgeType = "bezier" | "smoothstep" | "step" | "straight";

// biome-ignore lint/style/useConsistentTypeDefinitions: consistent with the other data types in this file
export type EdgeStylePreset = {
  type: EdgeType;
  strokeWidth: number;
  animated: boolean;
  colors: { api: string; dependency: string; event: string };
  dependencyDashArray: string;
  eventDashArray: string;
};

/** A single color-mode variant (light or dark) of a theme. */
// biome-ignore lint/style/useConsistentTypeDefinitions: consistent with the other data types in this file
export type ThemeVariant = {
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
    critical: string;
    unknown: string;
  };
  edge: EdgeStylePreset;
  selection: { background: string; border: string };
  typography: { fontFamily: string; nodeLabelSize: string };
  minimap: { background: string; nodeColor: string; maskOpacity: number };
};

/** A named theme with both light and dark variants. */
// biome-ignore lint/style/useConsistentTypeDefinitions: consistent with the other data types in this file
export type CanvasTheme = {
  id: string;
  name: string;
  light: ThemeVariant;
  dark: ThemeVariant;
};
