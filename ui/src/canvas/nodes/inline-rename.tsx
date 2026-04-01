import { useEffect, useRef, useState } from "react";
import { useCanvasStore } from "@/stores/canvas-store";

export function InlineRename({
  name,
  nodeId,
}: {
  name: string;
  nodeId: string;
}) {
  const renameNode = useCanvasStore((s) => s.renameNode);
  const setRenamingNodeId = useCanvasStore((s) => s.setRenamingNodeId);
  const [value, setValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.select();
  }, []);

  function commit() {
    if (value.trim()) {
      renameNode(nodeId, value);
    } else {
      setRenamingNodeId(null);
    }
  }

  return (
    <input
      className="orray-node__label orray-node__label--editing"
      onBlur={commit}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          commit();
        }
        if (e.key === "Escape") {
          setRenamingNodeId(null);
        }
        e.stopPropagation();
      }}
      ref={inputRef}
      size={Math.max(value.length, 1)}
      type="text"
      value={value}
    />
  );
}
