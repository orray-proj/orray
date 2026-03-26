import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useTheme } from "@/lib/theme";
import { useCanvasStore } from "@/stores/canvas-store";
import { edgeTypes } from "./edges/edge-types";
import { layoutGraph } from "./layout";
import { createMockTopology } from "./mock-data";
import { nodeTypes } from "./nodes/node-types";
import { useInjectPreset } from "./use-inject-preset";
import "@/styles/canvas.css";

function CanvasInner() {
  const { nodes, edges, setNodes, setEdges } = useCanvasStore(
    useShallow((s) => ({
      nodes: s.nodes,
      edges: s.edges,
      setNodes: s.setNodes,
      setEdges: s.setEdges,
    }))
  );

  const { resolvedTheme } = useTheme();
  useInjectPreset();

  useEffect(() => {
    const mock = createMockTopology();
    const laid = layoutGraph(mock.nodes, mock.edges);
    setNodes(laid);
    setEdges(mock.edges);
  }, [setNodes, setEdges]);

  return (
    <ReactFlow
      colorMode={resolvedTheme}
      edges={edges}
      edgesReconnectable={false}
      edgeTypes={edgeTypes}
      fitView
      nodes={nodes}
      nodesConnectable={false}
      nodesDraggable={false}
      nodeTypes={nodeTypes}
      onlyRenderVisibleElements
      proOptions={{ hideAttribution: false }}
    >
      <Background color="var(--orray-canvas-dot-color)" gap={20} size={1} />
      <Controls />
      <MiniMap pannable zoomable />
    </ReactFlow>
  );
}

export function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
