import type { NodeTypes } from "@xyflow/react";
import { ComponentNode } from "./component-node";
import { ResourceNode } from "./resource-node";

export const nodeTypes = {
  component: ComponentNode,
  resource: ResourceNode,
} as NodeTypes;
