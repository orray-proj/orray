import Dagre from "@dagrejs/dagre";
import type { CanvasEdge, CanvasNode } from "./types";

interface LayoutOptions {
  direction?: "TB" | "LR";
  nodeHeight?: number;
  nodeSep?: number;
  nodeWidth?: number;
  rankSep?: number;
}

const DEFAULTS: Required<LayoutOptions> = {
  direction: "TB",
  nodeWidth: 260,
  nodeHeight: 72,
  rankSep: 90,
  nodeSep: 50,
};

export function layoutGraph(
  nodes: CanvasNode[],
  edges: CanvasEdge[],
  options?: LayoutOptions
): CanvasNode[] {
  const opts = { ...DEFAULTS, ...options };

  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: opts.direction,
    ranksep: opts.rankSep,
    nodesep: opts.nodeSep,
  });

  for (const node of nodes) {
    g.setNode(node.id, { width: opts.nodeWidth, height: opts.nodeHeight });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  Dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    if (!pos) {
      return node;
    }
    return {
      ...node,
      position: {
        x: pos.x - opts.nodeWidth / 2,
        y: pos.y - opts.nodeHeight / 2,
      },
    };
  });
}
