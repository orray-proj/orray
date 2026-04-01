import {
  Content,
  Item,
  Portal,
  Root,
  Sub,
  SubContent,
  SubTrigger,
  Trigger,
} from "@radix-ui/react-context-menu";
import { useReactFlow } from "@xyflow/react";
import { useCallback, useState } from "react";
import type { ComponentKind, ResourceKind } from "@/canvas/types";
import { useCanvasStore } from "@/stores/canvas-store";

const COMPONENT_KINDS: ComponentKind[] = [
  "service",
  "web",
  "gateway",
  "job",
  "pipeline",
];
const RESOURCE_KINDS: ResourceKind[] = [
  "database",
  "queue",
  "cache",
  "storage",
  "external",
];

interface CanvasContextMenuProps {
  children: React.ReactNode;
}

export function CanvasContextMenu({ children }: CanvasContextMenuProps) {
  const phase = useCanvasStore((s) => s.phase);
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const removeEdge = useCanvasStore((s) => s.removeEdge);
  const setRenamingNodeId = useCanvasStore((s) => s.setRenamingNodeId);
  const { getNode } = useReactFlow();

  const [target, setTarget] = useState<
    | { type: "node"; id: string; nodeType: "component" | "resource" }
    | { type: "edge"; id: string }
    | null
  >(null);

  const onContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (phase !== "reviewing") {
        return;
      }

      const edgeEl = (e.target as HTMLElement).closest(".react-flow__edge");
      if (edgeEl) {
        const edgeId = edgeEl.getAttribute("data-id");
        if (edgeId) {
          setTarget({ type: "edge", id: edgeId });
          return;
        }
      }

      const nodeEl = (e.target as HTMLElement).closest(".react-flow__node");
      if (nodeEl) {
        const nodeId = nodeEl.getAttribute("data-id");
        if (nodeId) {
          const node = getNode(nodeId);
          const nodeType = (node?.type ?? "component") as
            | "component"
            | "resource";
          setTarget({ type: "node", id: nodeId, nodeType });
          return;
        }
      }

      setTarget(null);
    },
    [phase, getNode]
  );

  function handleReclassify(nodeId: string, kind: string) {
    updateNodeData(nodeId, (d) => ({
      ...d,
      kind: kind as ComponentKind | ResourceKind,
    }));
  }

  if (phase !== "reviewing") {
    return <>{children}</>;
  }

  function getKindsForTarget() {
    if (target?.type !== "node") {
      return [];
    }
    return target.nodeType === "component" ? COMPONENT_KINDS : RESOURCE_KINDS;
  }

  const kinds = getKindsForTarget();

  return (
    <Root>
      <Trigger asChild onContextMenu={onContextMenu}>
        {children}
      </Trigger>

      {target && (
        <Portal>
          <Content className="orray-context-menu">
            {target.type === "node" && (
              <>
                <Item
                  className="orray-context-menu__item"
                  onSelect={() => setRenamingNodeId(target.id)}
                >
                  Rename
                </Item>
                <Sub>
                  <SubTrigger className="orray-context-menu__item">
                    Reclassify
                  </SubTrigger>
                  <Portal>
                    <SubContent className="orray-context-menu">
                      {kinds.map((k) => (
                        <Item
                          className="orray-context-menu__item"
                          key={k}
                          onSelect={() => handleReclassify(target.id, k)}
                        >
                          {k}
                        </Item>
                      ))}
                    </SubContent>
                  </Portal>
                </Sub>
              </>
            )}

            {target.type === "edge" && (
              <Item
                className="orray-context-menu__item orray-context-menu__item--destructive"
                onSelect={() => removeEdge(target.id)}
              >
                Mark as incorrect
              </Item>
            )}
          </Content>
        </Portal>
      )}
    </Root>
  );
}
