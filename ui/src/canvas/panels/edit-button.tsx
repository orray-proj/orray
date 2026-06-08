import { motion } from "framer-motion";
import { PencilIcon } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useDraggablePosition } from "@/canvas/use-draggable-position";
import { useCanvasStore } from "@/stores/canvas-store";

const MORPH = { type: "spring" as const, stiffness: 500, damping: 35 };
const FADE = { duration: 0.2, ease: "easeInOut" as const };
const COLLAPSED_SIZE = 36;

/**
 * Morphing canvas control — one continuous element that stretches between
 * a circular pencil icon (committed) and a review bar (reviewing).
 *
 * Both content sets live in the DOM at all times. The outer shell animates
 * width/height via spring physics. Inner content cross-fades with opacity.
 * No AnimatePresence, no unmount — pure property animation.
 */
export function CanvasControl() {
  const { t } = useTranslation();
  const phase = useCanvasStore((s) => s.phase);
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const commit = useCanvasStore((s) => s.commit);
  const enterReview = useCanvasStore((s) => s.enterReview);

  const isReviewing = phase === "reviewing";

  const { position, containerRef, onPointerDown } = useDraggablePosition({
    x: 16,
    y: 16,
  });

  // Measure the bar's natural width so the shell animates to the right size
  const barRef = useRef<HTMLDivElement>(null);
  const barWidth = barRef.current?.scrollWidth ?? 380;

  return (
    <motion.div
      animate={{
        width: isReviewing ? barWidth + 2 : COLLAPSED_SIZE,
        height: COLLAPSED_SIZE,
      }}
      className="orray-canvas-control"
      onPointerDown={onPointerDown}
      ref={containerRef}
      style={{
        left: position.x,
        top: position.y,
        overflow: "hidden",
      }}
      transition={MORPH}
    >
      {/* ---- Collapsed: pencil icon ---- */}
      <motion.button
        animate={{
          opacity: isReviewing ? 0 : 1,
          scale: isReviewing ? 0.5 : 1,
        }}
        aria-label={t("canvas.edit")}
        className="orray-canvas-control__icon"
        onClick={isReviewing ? undefined : enterReview}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: isReviewing ? "none" : "auto",
        }}
        tabIndex={isReviewing ? -1 : 0}
        transition={FADE}
        type="button"
      >
        <PencilIcon className="h-4 w-4" />
      </motion.button>

      {/* ---- Expanded: review bar ---- */}
      <motion.div
        animate={{
          opacity: isReviewing ? 1 : 0,
        }}
        className="orray-canvas-control__bar"
        ref={barRef}
        style={{
          pointerEvents: isReviewing ? "auto" : "none",
        }}
        transition={FADE}
      >
        <span className="orray-canvas-control__label">
          {t("canvas.autoDiscovered")}
        </span>
        <span className="orray-canvas-control__sep" />
        <span className="orray-canvas-control__stat">
          {nodes.length} {t("canvas.services")}
        </span>
        <span className="orray-canvas-control__sep" />
        <span className="orray-canvas-control__stat">
          {edges.length} {t("canvas.connections")}
        </span>
        <button
          className="orray-canvas-control__action"
          onClick={isReviewing ? commit : undefined}
          tabIndex={isReviewing ? 0 : -1}
          type="button"
        >
          {t("canvas.commit")}
        </button>
      </motion.div>
    </motion.div>
  );
}
