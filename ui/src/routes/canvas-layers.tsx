import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { LayoutGroup, motion } from "framer-motion";
import {
  BoxIcon,
  GripHorizontalIcon,
  GripVerticalIcon,
  PlusIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCanvasStore } from "@/stores/canvas-store";
import { routeTree } from "./__root";

export const canvasLayersRoute = createRoute({
  getParentRoute: () => routeTree,
  path: "/canvas/$canvasId/layers",
  component: CanvasLayersPage,
});

interface NamespaceMeta {
  name: string;
  pods: number;
  workloads: number;
}

const MOCK_NAMESPACES: NamespaceMeta[] = [
  { name: "api-gateway", workloads: 3, pods: 6 },
  { name: "auth-prod", workloads: 2, pods: 4 },
  { name: "auth-staging", workloads: 2, pods: 2 },
  { name: "catalog-prod", workloads: 4, pods: 8 },
  { name: "catalog-staging", workloads: 4, pods: 4 },
  { name: "checkout-prod", workloads: 3, pods: 9 },
  { name: "checkout-staging", workloads: 3, pods: 3 },
  { name: "monitoring", workloads: 5, pods: 12 },
  { name: "notifications-prod", workloads: 2, pods: 4 },
  { name: "notifications-staging", workloads: 2, pods: 2 },
  { name: "payments-prod", workloads: 3, pods: 6 },
  { name: "payments-staging", workloads: 3, pods: 3 },
  { name: "search-prod", workloads: 2, pods: 6 },
  { name: "search-staging", workloads: 2, pods: 2 },
  { name: "shared-infra", workloads: 6, pods: 14 },
  { name: "workers-prod", workloads: 4, pods: 8 },
  { name: "workers-staging", workloads: 4, pods: 4 },
];

const NS_META_MAP = new Map(MOCK_NAMESPACES.map((ns) => [ns.name, ns]));
const STAGING_ID = "__staging__";
const CREATE_LAYER_ID = "__create_layer__";

interface Layer {
  id: string;
  name: string;
  namespaces: string[];
}

type ActiveDrag =
  | { type: "namespace"; id: string }
  | { type: "layer"; id: string }
  | null;

function CanvasLayersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setPhase = useCanvasStore((s) => s.setPhase);
  const [layers, setLayers] = useState<Layer[]>([
    { id: "layer:default", name: "Default", namespaces: ["default"] },
  ]);
  const [activeDrag, setActiveDrag] = useState<ActiveDrag>(null);
  const [newLayerId, setNewLayerId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const layerIds = layers.map((l) => l.id);
  const isDraggingNamespace = activeDrag?.type === "namespace";
  const assignedSet = new Set(layers.flatMap((l) => l.namespaces));
  const unassigned = MOCK_NAMESPACES.map((ns) => ns.name).filter(
    (ns) => !assignedSet.has(ns)
  );
  const filteredUnassigned = search
    ? unassigned.filter((ns) => ns.toLowerCase().includes(search.toLowerCase()))
    : unassigned;
  const hasNamespaces = MOCK_NAMESPACES.length > 0;

  function findContainerId(ns: string): string | null {
    if (unassigned.includes(ns)) {
      return STAGING_ID;
    }
    for (const layer of layers) {
      if (layer.namespaces.includes(ns)) {
        return layer.id;
      }
    }
    return null;
  }

  function onDragStart(event: DragStartEvent) {
    const id = event.active.id as string;
    if (layers.some((l) => l.id === id)) {
      setActiveDrag({ type: "layer", id });
    } else {
      setActiveDrag({ type: "namespace", id });
    }
  }

  function handleLayerReorder(activeId: string, overId: string) {
    const oldIndex = layers.findIndex((l) => l.id === activeId);
    const newIndex = layers.findIndex((l) => l.id === overId);
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
      return;
    }
    const reordered = [...layers];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    setLayers(reordered);
  }

  function resolveDropTarget(overId: string): string | null {
    if (layers.some((l) => l.id === overId)) {
      return overId;
    }
    const resolved = findContainerId(overId);
    return resolved !== STAGING_ID ? resolved : null;
  }

  function moveNamespace(ns: string, fromId: string | null, toId: string) {
    const removeFrom = (l: Layer) =>
      l.id === fromId
        ? { ...l, namespaces: l.namespaces.filter((n) => n !== ns) }
        : l;
    const addTo = (l: Layer) =>
      l.id === toId ? { ...l, namespaces: [...l.namespaces, ns] } : l;

    if (fromId === STAGING_ID || !fromId) {
      setLayers(layers.map(addTo));
    } else if (toId === STAGING_ID) {
      setLayers(layers.map(removeFrom));
    } else {
      setLayers(layers.map((l) => removeFrom(addTo(l))));
    }
  }

  function onDragEnd(event: DragEndEvent) {
    const drag = activeDrag;
    setActiveDrag(null);
    const { active, over } = event;
    if (!(over && drag)) {
      return;
    }

    if (drag.type === "layer") {
      handleLayerReorder(active.id as string, over.id as string);
      return;
    }

    const ns = active.id as string;
    const fromId = findContainerId(ns);

    if (over.id === CREATE_LAYER_ID) {
      const newId = `layer:${crypto.randomUUID().slice(0, 8)}`;
      setLayers([
        ...layers.map((l) =>
          l.id === fromId
            ? { ...l, namespaces: l.namespaces.filter((n) => n !== ns) }
            : l
        ),
        { id: newId, name: "", namespaces: [ns] },
      ]);
      setNewLayerId(newId);
      return;
    }

    if (over.id === STAGING_ID) {
      if (fromId && fromId !== STAGING_ID) {
        moveNamespace(ns, fromId, STAGING_ID);
      }
      return;
    }

    const toId = resolveDropTarget(over.id as string);
    if (!toId || fromId === toId) {
      return;
    }
    moveNamespace(ns, fromId, toId);
  }

  function addLayer() {
    const id = `layer:${crypto.randomUUID().slice(0, 8)}`;
    setLayers([...layers, { id, name: "", namespaces: [] }]);
    setNewLayerId(id);
  }

  function removeLayer(layerId: string) {
    setLayers(layers.filter((l) => l.id !== layerId));
  }

  function renameLayer(layerId: string, name: string) {
    setLayers(layers.map((l) => (l.id === layerId ? { ...l, name } : l)));
  }

  function handleContinue() {
    setPhase("reviewing");
    navigate({ to: "/canvas/$canvasId", params: { canvasId: "default" } });
  }

  const activeMeta =
    activeDrag?.type === "namespace"
      ? NS_META_MAP.get(activeDrag.id)
      : undefined;

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-2 border-border border-b px-8 pt-8 pb-6">
        <h1 className="font-semibold text-xl">{t("layers.title")}</h1>
        <p className="max-w-lg text-sm opacity-50">{t("layers.description")}</p>
      </div>

      {hasNamespaces ? (
        <DndContext
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          sensors={sensors}
        >
          <LayoutGroup>
            <div className="flex flex-1 overflow-hidden">
              {/* Staging zone — left panel */}
              <div className="flex w-[280px] shrink-0 flex-col overflow-hidden border-border border-r">
                <div className="flex items-center gap-2 border-border border-b px-4 py-3">
                  <SearchIcon className="h-4 w-4 shrink-0 opacity-30" />
                  <input
                    className="w-full bg-transparent text-sm outline-none placeholder:opacity-30"
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("layers.searchNamespaces")}
                    type="text"
                    value={search}
                  />
                </div>
                <StagingDropZone>
                  <div className="scrollbar-hidden flex h-full flex-col gap-1 overflow-y-auto p-4">
                    {filteredUnassigned.length === 0 &&
                      unassigned.length === 0 && (
                        <span className="py-4 text-center text-xs opacity-30">
                          {t("layers.allAssigned")}
                        </span>
                      )}
                    {filteredUnassigned.length === 0 &&
                      unassigned.length > 0 &&
                      search && (
                        <span className="py-4 text-center text-xs opacity-30">
                          No results
                        </span>
                      )}
                    {filteredUnassigned.map((ns) => (
                      <DraggableNamespace
                        key={ns}
                        meta={NS_META_MAP.get(ns)}
                        name={ns}
                      />
                    ))}
                  </div>
                </StagingDropZone>
              </div>

              {/* Layers area — right */}
              <div className="scrollbar-hidden flex flex-1 items-start gap-6 overflow-auto p-8">
                <SortableContext
                  items={layerIds}
                  strategy={horizontalListSortingStrategy}
                >
                  {layers.map((layer) => (
                    <SortableLayerColumn
                      canRemove={layers.length > 1}
                      id={layer.id}
                      key={layer.id}
                      onRemove={removeLayer}
                    >
                      <LayerHeader
                        autoFocus={layer.id === newLayerId}
                        count={layer.namespaces.length}
                        layerId={layer.id}
                        name={layer.name}
                        onFocused={() => setNewLayerId(null)}
                        onRename={renameLayer}
                      />
                      <DroppableZone id={layer.id}>
                        {layer.namespaces.length === 0 && (
                          <motion.span
                            animate={{ opacity: [0.15, 0.3, 0.15] }}
                            className="py-6 text-center text-xs opacity-20"
                            transition={{
                              duration: 2.5,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "easeInOut",
                            }}
                          >
                            {t("layers.dropHere")}
                          </motion.span>
                        )}
                        {layer.namespaces.map((ns) => (
                          <DraggableNamespace
                            key={ns}
                            meta={NS_META_MAP.get(ns)}
                            name={ns}
                          />
                        ))}
                      </DroppableZone>
                    </SortableLayerColumn>
                  ))}
                </SortableContext>

                <AddLayerButton
                  isDragging={isDraggingNamespace}
                  onAdd={addLayer}
                />
              </div>
            </div>
          </LayoutGroup>

          <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
            {activeDrag?.type === "namespace" && activeMeta && (
              <motion.div
                animate={{ scale: 1.05, rotate: 1.5 }}
                className="flex flex-col gap-0.5 rounded-lg bg-accent px-3 py-2 shadow-2xl ring-1 ring-ring/20"
                initial={{ scale: 1, rotate: 0 }}
              >
                <div className="flex items-center gap-2">
                  <GripVerticalIcon className="h-3 w-3 opacity-40" />
                  <span className="font-medium font-mono text-xs">
                    {activeDrag.id}
                  </span>
                </div>
                <span className="pl-5 text-[10px] opacity-40">
                  {activeMeta.workloads} workloads &middot; {activeMeta.pods}{" "}
                  pods
                </span>
              </motion.div>
            )}
            {activeDrag?.type === "layer" && (
              <motion.div
                animate={{ scale: 1.03 }}
                className="rounded-lg border border-border bg-card p-4 shadow-2xl"
                initial={{ scale: 1 }}
              >
                <span className="font-medium text-sm">
                  {layers.find((l) => l.id === activeDrag.id)?.name || "Layer"}
                </span>
              </motion.div>
            )}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
          <BoxIcon className="h-12 w-12 opacity-15" />
          <p className="max-w-sm text-center text-sm opacity-40">
            {t("layers.noNamespaces")}
          </p>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 border-border border-t px-8 py-4">
        <button
          className="rounded-md bg-foreground px-6 py-2 font-medium text-background text-sm transition-opacity hover:opacity-80"
          onClick={handleContinue}
          type="button"
        >
          {t("common.continue")}
        </button>
      </div>
    </div>
  );
}

// --- Staging drop zone (left panel, receives namespaces back) ---

function StagingDropZone({ children }: { children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id: STAGING_ID });

  return (
    <div
      className={`flex-1 overflow-hidden transition-colors duration-150 ${isOver ? "bg-accent/20" : ""}`}
      ref={setNodeRef}
    >
      {children}
    </div>
  );
}

// --- Add layer button (also a drop target) ---

function AddLayerButton({
  isDragging,
  onAdd,
}: {
  isDragging: boolean;
  onAdd: () => void;
}) {
  const { t } = useTranslation();
  const { isOver, setNodeRef } = useDroppable({ id: CREATE_LAYER_ID });

  return (
    <motion.button
      animate={
        isDragging
          ? {
              opacity: 1,
              borderColor: isOver ? "var(--color-ring)" : "var(--color-border)",
              scale: isOver ? 1.04 : 1,
            }
          : { opacity: 0.4 }
      }
      className="flex h-fit min-w-[280px] flex-col items-center justify-center gap-2 self-start rounded-lg border border-border border-dashed p-8 transition-colors"
      onClick={onAdd}
      ref={setNodeRef}
      type="button"
    >
      <PlusIcon className="h-5 w-5" />
      <span className="text-xs">
        {isDragging ? t("layers.dropToCreate") : t("layers.addLayer")}
      </span>
    </motion.button>
  );
}

// --- Sortable layer column ---

function SortableLayerColumn({
  canRemove,
  children,
  id,
  onRemove,
}: {
  canRemove: boolean;
  children: React.ReactNode;
  id: string;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className="group/layer flex min-w-[280px] shrink-0 flex-col gap-1 self-start rounded-lg border border-border bg-card p-4 transition-opacity"
      ref={setNodeRef}
      style={{ ...style, opacity: isDragging ? 0.3 : 1 }}
    >
      <div className="mb-1 flex items-center justify-between">
        <div className="w-5" />
        <div
          className="cursor-grab opacity-20 transition-opacity hover:opacity-50 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripHorizontalIcon className="h-4 w-4" />
        </div>
        {canRemove ? (
          <button
            className="hover:!opacity-100 flex w-5 justify-end opacity-0 transition-opacity group-hover/layer:opacity-30"
            onClick={() => onRemove(id)}
            type="button"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        ) : (
          <div className="w-5" />
        )}
      </div>
      {children}
    </div>
  );
}

// --- Droppable zone inside a layer ---

function DroppableZone({
  children,
  id,
}: {
  children: React.ReactNode;
  id: string;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      className={`flex min-h-[60px] flex-col gap-1 rounded-md px-1 py-1 transition-colors duration-150 ${
        isOver ? "bg-accent/30" : ""
      }`}
      ref={setNodeRef}
    >
      {children}
    </div>
  );
}

// --- Layer header ---

function LayerHeader({
  autoFocus,
  count,
  layerId,
  name,
  onFocused,
  onRename,
}: {
  autoFocus: boolean;
  count: number;
  layerId: string;
  name: string;
  onFocused: () => void;
  onRename: (id: string, name: string) => void;
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
      inputRef.current?.select();
      onFocused();
    }
  }, [autoFocus, onFocused]);

  return (
    <div className="flex items-center justify-between gap-2">
      <input
        className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1 font-medium text-sm outline-none placeholder:opacity-30 hover:bg-muted focus:bg-muted"
        onChange={(e) => onRename(layerId, e.target.value)}
        placeholder={t("layers.layerNamePlaceholder")}
        ref={inputRef}
        value={name}
      />
      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] tabular-nums opacity-40">
        {count}
      </span>
    </div>
  );
}

// --- Draggable namespace pill ---

function DraggableNamespace({
  meta,
  name,
}: {
  meta: NamespaceMeta | undefined;
  name: string;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: name,
  });

  return (
    <motion.div
      className={`flex cursor-grab items-start gap-2 rounded-lg bg-muted px-3 py-2 active:cursor-grabbing ${
        isDragging ? "opacity-20" : ""
      }`}
      layout="position"
      layoutId={`ns-${name}`}
      ref={setNodeRef}
      transition={{ layout: { type: "spring", stiffness: 350, damping: 30 } }}
      {...listeners}
      {...attributes}
    >
      <GripVerticalIcon className="mt-0.5 h-3 w-3 shrink-0 opacity-20" />
      <div className="flex flex-col gap-0.5">
        <span className="font-medium font-mono text-xs leading-tight">
          {name}
        </span>
        {meta && (
          <span className="text-[10px] leading-tight opacity-35">
            {meta.workloads} workloads &middot; {meta.pods} pods
          </span>
        )}
      </div>
    </motion.div>
  );
}
