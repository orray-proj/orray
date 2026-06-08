import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { useTheme } from "@/lib/theme";
import { useCanvasStore } from "@/stores/canvas-store";
import { CanvasContextMenu } from "./context-menu";
import { edgeTypes } from "./edges/edge-types";
import { layoutGraph } from "./layout";
import { createMockTopology, MOCK_LAYERS } from "./mock-data";
import { nodeTypes } from "./nodes/node-types";
import { CanvasControl } from "./panels/edit-button";
import { LayerSwitcher } from "./panels/layer-switcher";

function CanvasInner() {
  const {
    nodes,
    edges,
    phase,
    activeLayerId,
    onNodesChange,
    setNodes,
    setEdges,
    setActiveLayerId,
  } = useCanvasStore(
    useShallow((s) => ({
      nodes: s.nodes,
      edges: s.edges,
      phase: s.phase,
      activeLayerId: s.activeLayerId,
      onNodesChange: s.onNodesChange,
      setNodes: s.setNodes,
      setEdges: s.setEdges,
      setActiveLayerId: s.setActiveLayerId,
    }))
  );

  const { resolvedTheme } = useTheme();
  const { fitView } = useReactFlow();
  const hasFitRef = useRef(false);

  useEffect(() => {
    const mock = createMockTopology();
    const laid = layoutGraph(mock.nodes, mock.edges);
    setNodes(laid);
    setEdges(mock.edges);
  }, [setNodes, setEdges]);

  // Fit view once after initial data load, not on every render
  useEffect(() => {
    if (!hasFitRef.current && nodes.length > 0) {
      hasFitRef.current = true;
      // Small delay so ReactFlow has measured the nodes
      requestAnimationFrame(() => fitView());
    }
  }, [nodes.length, fitView]);

  // Fallback: ensure activeLayerId is always set.
  // The layer setup page sets this on Continue (Q7b), but if the user
  // bookmarks the canvas URL directly or if the persisted ID doesn't match
  // any available layer (e.g. mock data uses different IDs than the BE),
  // this resets to the first available layer. This disconnect between
  // layer-setup IDs and mock topology IDs is accepted for now — it will
  // converge when GET /topology returns real data keyed by real layer IDs.
  useEffect(() => {
    if (!activeLayerId && MOCK_LAYERS.length > 0) {
      setActiveLayerId(MOCK_LAYERS[0].id);
    }
  }, [activeLayerId, setActiveLayerId]);

  const isReviewing = phase === "reviewing";
  const showControls = phase === "reviewing" || phase === "committed";

  return (
    <CanvasContextMenu>
      <div className="relative h-full w-full">
        <ReactFlow
          colorMode={resolvedTheme}
          edges={edges}
          edgesReconnectable={false}
          edgeTypes={edgeTypes}
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
          {showControls && <CanvasControl />}
          <LayerSwitcher layers={[...MOCK_LAYERS]} />
        </ReactFlow>
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
