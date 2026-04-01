import type { Connection, EdgeChange, NodeChange } from "@xyflow/react";
import { addEdge, applyEdgeChanges, applyNodeChanges } from "@xyflow/react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CanvasEdge, CanvasNode } from "@/canvas/types";

export type CanvasPhase =
  | "layer-setup"
  | "discovering"
  | "reviewing"
  | "committed";

interface CanvasState {
  activeLayerId: string | null;

  commit: () => void;
  edges: CanvasEdge[];
  enterReview: () => void;
  nodes: CanvasNode[];
  onConnect: (connection: Connection) => void;
  onEdgesChange: (changes: EdgeChange<CanvasEdge>[]) => void;
  onNodesChange: (changes: NodeChange<CanvasNode>[]) => void;
  phase: CanvasPhase;
  removeEdge: (edgeId: string) => void;
  renameNode: (nodeId: string, name: string) => void;
  renamingNodeId: string | null;
  setActiveLayerId: (id: string | null) => void;
  setEdges: (edges: CanvasEdge[]) => void;
  setNodes: (nodes: CanvasNode[]) => void;
  setPhase: (phase: CanvasPhase) => void;
  setRenamingNodeId: (id: string | null) => void;
  updateNodeData: (
    nodeId: string,
    updater: (data: CanvasNode["data"]) => CanvasNode["data"]
  ) => void;
}

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set, get) => ({
      activeLayerId: null,
      edges: [],
      nodes: [],
      phase: "layer-setup" as CanvasPhase,
      renamingNodeId: null,

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
      setPhase: (phase) => set({ phase }),

      commit: () => set({ phase: "committed" }),
      enterReview: () => set({ phase: "reviewing" }),

      renameNode: (nodeId, name) => {
        if (!name.trim()) {
          return;
        }
        set({
          nodes: get().nodes.map((n) =>
            n.id === nodeId
              ? { ...n, data: { ...n.data, name: name.trim() } }
              : n
          ),
          renamingNodeId: null,
        });
      },

      setRenamingNodeId: (id) => set({ renamingNodeId: id }),

      removeEdge: (edgeId) => {
        set({ edges: get().edges.filter((e) => e.id !== edgeId) });
      },

      updateNodeData: (nodeId, updater) => {
        set({
          nodes: get().nodes.map((n) =>
            n.id === nodeId ? { ...n, data: updater(n.data) } : n
          ),
        });
      },
    }),
    {
      name: "orray-canvas",
      partialize: (state) => ({
        phase: state.phase,
      }),
    }
  )
);
