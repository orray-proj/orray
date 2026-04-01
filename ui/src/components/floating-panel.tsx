import { type PointerEvent, useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface FloatingPanelProps {
  children: React.ReactNode;
  className?: string;
  defaultPosition?: { x: number; y: number };
}

export function FloatingPanel({
  children,
  className,
  defaultPosition = { x: 16, y: 16 },
}: FloatingPanelProps) {
  const [position, setPosition] = useState(defaultPosition);
  const dragRef = useRef<{ startX: number; startY: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const onPointerDown = useCallback(
    (e: PointerEvent) => {
      // Always stop propagation so ReactFlow doesn't capture the event
      e.stopPropagation();

      // Don't start a drag if clicking interactive elements
      if (
        (e.target as HTMLElement).closest("button, input, select, textarea, a")
      ) {
        return;
      }
      dragRef.current = {
        startX: e.clientX - position.x,
        startY: e.clientY - position.y,
      };
      panelRef.current?.setPointerCapture(e.pointerId);
    },
    [position]
  );

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!dragRef.current) {
      return;
    }
    setPosition({
      x: e.clientX - dragRef.current.startX,
      y: e.clientY - dragRef.current.startY,
    });
  }, []);

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  return (
    <div
      className={cn("orray-floating-panel", className)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      ref={panelRef}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {children}
    </div>
  );
}
