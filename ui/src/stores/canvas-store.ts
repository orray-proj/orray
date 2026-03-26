import type { Connection, EdgeChange, NodeChange } from "@xyflow/react";
import { addEdge, applyEdgeChanges, applyNodeChanges } from "@xyflow/react";
import { create } from "zustand";
import type { CanvasEdge, CanvasNode } from "@/canvas/types";

interface CanvasState {
  activeLayerId: string | null;
  edges: CanvasEdge[];
  nodes: CanvasNode[];
  onConnect: (connection: Connection) => void;
  onEdgesChange: (changes: EdgeChange<CanvasEdge>[]) => void;
  onNodesChange: (changes: NodeChange<CanvasNode>[]) => void;
  setActiveLayerId: (id: string | null) => void;
  setEdges: (edges: CanvasEdge[]) => void;
  setNodes: (nodes: CanvasNode[]) => void;
}

export const useCanvasStore = create<CanvasState>()((set, get) => ({
  activeLayerId: null,
  nodes: [],
  edges: [],

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    set({ edges: addEdge(connection, get().edges) });
  },

  setActiveLayerId: (id) => set({ activeLayerId: id }),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
}));
