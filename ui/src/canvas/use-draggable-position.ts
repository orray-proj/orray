import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

const DRAG_THRESHOLD = 4;

interface DraggablePosition {
  /** Ref to attach to the draggable container element. */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** True while a drag is in progress (past threshold). */
  isDragging: boolean;
  /** Attach to onPointerDown on the container. */
  onPointerDown: (e: ReactPointerEvent) => void;
  /** Current left/top position. */
  position: { x: number; y: number };
}

/**
 * Makes an absolutely-positioned element draggable via pointer events.
 *
 * Uses document-level listeners for move/up so that:
 * - Child button clicks fire normally (no pointer capture)
 * - Dragging works even if the pointer leaves the element
 * - stopPropagation on pointerdown prevents ReactFlow from panning
 *
 * After a drag, the next `click` event on the container is suppressed
 * via capture phase so that buttons don't fire when releasing a drag.
 */
export function useDraggablePosition(defaultPosition: {
  x: number;
  y: number;
}): DraggablePosition {
  const [position, setPosition] = useState(defaultPosition);
  const containerRef = useRef<HTMLDivElement>(null);

  const dragRef = useRef<{
    offsetX: number;
    offsetY: number;
    initClientX: number;
    initClientY: number;
    dragging: boolean;
  } | null>(null);

  // Suppress the click event that fires after a drag release
  const suppressNextClick = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }
    function handleClickCapture(e: MouseEvent) {
      if (suppressNextClick.current) {
        suppressNextClick.current = false;
        e.stopPropagation();
        e.preventDefault();
      }
    }
    el.addEventListener("click", handleClickCapture, true);
    return () => el.removeEventListener("click", handleClickCapture, true);
  }, []);

  // Document-level move/up handlers — attached on pointer-down, removed on pointer-up
  const handleDocumentMove = useCallback((e: globalThis.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) {
      return;
    }
    if (!drag.dragging) {
      const dx = Math.abs(e.clientX - drag.initClientX);
      const dy = Math.abs(e.clientY - drag.initClientY);
      if (dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) {
        return;
      }
      drag.dragging = true;
    }
    setPosition({
      x: e.clientX - drag.offsetX,
      y: e.clientY - drag.offsetY,
    });
  }, []);

  const handleDocumentUp = useCallback(() => {
    if (dragRef.current?.dragging) {
      suppressNextClick.current = true;
    }
    dragRef.current = null;
    document.removeEventListener("pointermove", handleDocumentMove);
    document.removeEventListener("pointerup", handleDocumentUp);
  }, [handleDocumentMove]);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent) => {
      // Prevent ReactFlow from capturing this event (panning, selecting)
      e.stopPropagation();

      dragRef.current = {
        offsetX: e.clientX - position.x,
        offsetY: e.clientY - position.y,
        initClientX: e.clientX,
        initClientY: e.clientY,
        dragging: false,
      };

      document.addEventListener("pointermove", handleDocumentMove);
      document.addEventListener("pointerup", handleDocumentUp);
    },
    [position, handleDocumentMove, handleDocumentUp]
  );

  const isDragging = dragRef.current?.dragging ?? false;

  return { position, containerRef, onPointerDown, isDragging };
}
