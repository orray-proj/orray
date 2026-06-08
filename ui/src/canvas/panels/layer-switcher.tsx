import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDraggablePosition } from "@/canvas/use-draggable-position";
import { useCanvasStore } from "@/stores/canvas-store";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LayerInfo {
  color: string;
  id: string;
  name: string;
}

interface LayerSwitcherProps {
  layers: LayerInfo[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SPRING = { type: "spring" as const, stiffness: 500, damping: 36 };
const PLANE_HEIGHT = 32;
const COLLAPSED_GAP = 6;
const EXPANDED_GAP = PLANE_HEIGHT + 4;
const RECEDE_SCALE = 0.94;
const RECEDE_OPACITY = 0.5;
const HINT_STAGGER_MS = 40;

function isTextInput(el: Element | null): boolean {
  if (!el) {
    return false;
  }
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") {
    return true;
  }
  if ((el as HTMLElement).isContentEditable) {
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// LayerPlane
// ---------------------------------------------------------------------------

function LayerPlane({
  depth,
  expandDirection,
  expanded,
  index,
  isActive,
  layer,
  onSelect,
  totalLayers,
}: {
  depth: number;
  expandDirection: number;
  expanded: boolean;
  index: number;
  isActive: boolean;
  layer: LayerInfo;
  onSelect: () => void;
  totalLayers: number;
}) {
  const { t } = useTranslation();

  const gap = expanded ? EXPANDED_GAP : COLLAPSED_GAP;
  const yOffset = depth * gap * expandDirection;
  const zOffset = isActive ? 0 : -Math.abs(depth) * 12;
  const scale = isActive || expanded ? 1 : RECEDE_SCALE;
  const inactiveRotateX = depth < 0 ? 3 : -3;
  const opacity = isActive || expanded ? 1 : RECEDE_OPACITY;

  return (
    <motion.button
      animate={{
        opacity,
        rotateX: isActive || expanded ? 0 : inactiveRotateX,
        scale,
        y: yOffset,
        z: expanded ? 0 : zOffset,
      }}
      aria-checked={isActive}
      aria-label={t("layers.switchTo", { name: layer.name })}
      className="orray-layer-switcher__plane"
      data-active={isActive || undefined}
      initial={false}
      layout
      onClick={onSelect}
      role="radio"
      style={{
        zIndex: isActive ? totalLayers + 1 : totalLayers - Math.abs(depth),
      }}
      transition={SPRING}
      type="button"
    >
      <motion.span
        animate={{ opacity: expanded ? 0.5 : 0 }}
        className="orray-layer-switcher__hint"
        transition={{
          duration: 0.15,
          delay: expanded ? index * (HINT_STAGGER_MS / 1000) : 0,
        }}
      >
        {index + 1}
      </motion.span>

      <span className="orray-layer-switcher__indicator-wrap">
        <span
          className="orray-layer-switcher__dot"
          style={{ backgroundColor: layer.color }}
        />
        {isActive && (
          <span
            className="orray-layer-switcher__pulse"
            style={{ backgroundColor: layer.color }}
          />
        )}
      </span>

      <span className="orray-layer-switcher__name">{layer.name}</span>

      {isActive && (
        <motion.span
          className="orray-layer-switcher__edge-light"
          layoutId="layer-edge-light"
          style={{ backgroundColor: layer.color }}
          transition={SPRING}
        />
      )}
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// LayerSwitcher
// ---------------------------------------------------------------------------

export function LayerSwitcher({ layers }: LayerSwitcherProps) {
  const { t } = useTranslation();
  const activeLayerId = useCanvasStore((s) => s.activeLayerId);
  const setActiveLayerId = useCanvasStore((s) => s.setActiveLayerId);

  const [expanded, setExpanded] = useState(false);

  const { position, containerRef, onPointerDown } = useDraggablePosition({
    x: Math.max(16, window.innerWidth - 220 - 160),
    y: Math.max(16, window.innerHeight - 80),
  });

  // --- Keyboard shortcuts: 1-9 to switch layers ---
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isTextInput(document.activeElement)) {
        return;
      }
      const num = Number.parseInt(e.key, 10);
      if (num >= 1 && num <= layers.length) {
        e.preventDefault();
        setActiveLayerId(layers[num - 1].id);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [layers, setActiveLayerId]);

  const activeLayer = layers.find((l) => l.id === activeLayerId) ?? layers[0];
  const activeIndex = layers.findIndex((l) => l.id === activeLayerId);
  const resolvedIndex = activeIndex === -1 ? 0 : activeIndex;

  const inBottomHalf = position.y > window.innerHeight / 2;
  const expandDirection = inBottomHalf ? -1 : 1;

  const gap = expanded ? EXPANDED_GAP : COLLAPSED_GAP;
  const stackHeight =
    PLANE_HEIGHT + (layers.length - 1) * gap + (expanded ? 4 : 8);

  return (
    <div
      aria-label={t("layers.switcher")}
      className="orray-layer-switcher"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onPointerDown={onPointerDown}
      ref={containerRef}
      role="radiogroup"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <motion.div
        animate={{ backgroundColor: activeLayer?.color }}
        className="orray-layer-switcher__glow"
        transition={SPRING}
      />

      <motion.div
        animate={{ height: stackHeight }}
        className="orray-layer-switcher__stack"
        style={{
          perspective: "600px",
          perspectiveOrigin: inBottomHalf ? "50% 0%" : "50% 100%",
        }}
        transition={SPRING}
      >
        <AnimatePresence mode="popLayout">
          {layers.map((layer, i) => (
            <LayerPlane
              depth={i - resolvedIndex}
              expandDirection={expandDirection}
              expanded={expanded}
              index={i}
              isActive={i === resolvedIndex}
              key={layer.id}
              layer={layer}
              onSelect={() => setActiveLayerId(layer.id)}
              totalLayers={layers.length}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
