import { useTranslation } from "react-i18next";
import { FloatingPanel } from "@/components/floating-panel";
import { useCanvasStore } from "@/stores/canvas-store";

export function ReviewPanel() {
  const { t } = useTranslation();
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const commit = useCanvasStore((s) => s.commit);

  return (
    <FloatingPanel defaultPosition={{ x: 16, y: 16 }}>
      <span className="opacity-60">{t("canvas.autoDiscovered")}</span>
      <span className="orray-floating-panel__separator" />
      <span>
        {nodes.length} {t("canvas.services")}
      </span>
      <span className="orray-floating-panel__separator" />
      <span>
        {edges.length} {t("canvas.connections")}
      </span>
      <button
        className="orray-floating-panel__action"
        onClick={commit}
        type="button"
      >
        {t("canvas.commit")}
      </button>
    </FloatingPanel>
  );
}
