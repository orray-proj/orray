import { PencilIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FloatingPanel } from "@/components/floating-panel";
import { useCanvasStore } from "@/stores/canvas-store";

export function EditButton() {
  const { t } = useTranslation();
  const enterReview = useCanvasStore((s) => s.enterReview);

  return (
    <FloatingPanel defaultPosition={{ x: 16, y: 16 }}>
      <button
        className="orray-floating-panel__action"
        onClick={enterReview}
        type="button"
      >
        <PencilIcon className="h-3.5 w-3.5" />
        {t("canvas.edit")}
      </button>
    </FloatingPanel>
  );
}
