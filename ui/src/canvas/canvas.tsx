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
import { CanvasContextMenu } from "./context-menu";
import { edgeTypes } from "./edges/edge-types";
import { layoutGraph } from "./layout";
import { createMockTopology } from "./mock-data";
import { nodeTypes } from "./nodes/node-types";
import { EditButton } from "./panels/edit-button";
import { ReviewPanel } from "./panels/review-panel";
import { SettingsButton } from "./panels/settings-panel";
import { useInjectPreset } from "./use-inject-preset";
import "@/styles/canvas.css";

function CanvasInner() {
  const { nodes, edges, phase, onNodesChange, setNodes, setEdges } =
    useCanvasStore(
      useShallow((s) => ({
        nodes: s.nodes,
        edges: s.edges,
        phase: s.phase,
        onNodesChange: s.onNodesChange,
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

  const isReviewing = phase === "reviewing";

  return (
    <CanvasContextMenu>
      <div className="relative h-full w-full">
        <ReactFlow
          colorMode={resolvedTheme}
          edges={edges}
          edgesReconnectable={false}
          edgeTypes={edgeTypes}
          fitView
          nodes={nodes}
          nodesConnectable={false}
          nodesDraggable={isReviewing}
          nodeTypes={nodeTypes}
          onlyRenderVisibleElements
          onNodesChange={isReviewing ? onNodesChange : undefined}
          proOptions={{ hideAttribution: false }}
        >
          <Background color="var(--orray-canvas-dot-color)" gap={20} size={1} />
          <Controls />
          <MiniMap pannable zoomable />
          {phase === "reviewing" && <ReviewPanel />}
          {phase === "committed" && <EditButton />}
        </ReactFlow>
        <SettingsButton />
      </div>
    </CanvasContextMenu>
  );
}

export function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
