import { useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import { useGrocery } from "../context/GroceryContext";
import { placeLabel } from "../utils/placeFilter";
import {
  DndContext,
  closestCenter,
  pointerWithin,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  type CollisionDetection,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

export function ListDndProvider({
  mode,
  children,
}: {
  mode: "shopping" | "outOfStock";
  children: React.ReactNode;
}) {
  const {
    shoppingItems,
    outOfStockItems,
    categories,
    updateItemCategory,
    reorderCategories,
    reorderShoppingItems,
    reorderOutOfStockItems,
    updateItemLocation,
    updateItemStorageLocation,
    locations,
    storageLocations,
    showToast,
  } = useGrocery();

  const items = mode === "shopping" ? shoppingItems : outOfStockItems;
  const onItemReorder = mode === "shopping" ? reorderShoppingItems : reorderOutOfStockItems;

  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const collisionDetection: CollisionDetection = useCallback((args) => {
    const within = pointerWithin(args);
    if (within.length > 0) {
      if (typeof args.active.id === "string") {
        const catOnly = within.filter((c) => String(c.id).startsWith("cat-"));
        return catOnly.length > 0 ? catOnly : within;
      }
      // アイテムを動かしているときは、カテゴリの枠よりアイテムを優先する
      const itemsOnly = within.filter((c) => typeof c.id === "number");
      return itemsOnly.length > 0 ? itemsOnly : within;
    }
    if (typeof args.active.id === "number") return [];
    return closestCenter(args);
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (typeof active.id === "number" && over && typeof over.id === "string") {
      const overId = over.id as string;
      const itemId = active.id as number;
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      if (overId.startsWith("loc-tab-")) {
        if (overId === "loc-tab-__all__") return;
        const locName = overId === "loc-tab-__unset__" ? undefined : overId.slice(8);
        if (item.location !== locName) {
          const prevLocation = item.location;
          updateItemLocation(itemId, locName);
          showToast(`${item.name}の店を${placeLabel(locName, locations)}に設定`, "mdi:store", () => {
            updateItemLocation(itemId, prevLocation);
          });
        }
        return;
      }

      if (overId.startsWith("sloc-tab-")) {
        if (overId === "sloc-tab-__all__") return;
        const slocName = overId === "sloc-tab-__unset__" ? undefined : overId.slice(9);
        if (item.storageLocation !== slocName) {
          const prevStorageLocation = item.storageLocation;
          updateItemStorageLocation(itemId, slocName);
          showToast(`${item.name}の保管場所を${placeLabel(slocName, storageLocations)}に設定`, "mdi:package-variant", () => {
            updateItemStorageLocation(itemId, prevStorageLocation);
          });
        }
        return;
      }

      // カテゴリの枠（見出しなど）に落としたら、そのカテゴリに移す
      if (overId.startsWith("cat-")) {
        const category = overId.slice(4);
        if (item.category !== category) updateItemCategory(itemId, category);
      }
      return;
    }

    // 何もないところで離したときは何もしない（カテゴリは変えない）
    if (!over || active.id === over.id) return;

    if (typeof active.id === "string" && typeof over.id === "string") {
      const fromName = (active.id as string).slice(4);
      const toName = (over.id as string).slice(4);
      const fromIdx = categories.findIndex((c) => c.name === fromName);
      const toIdx = categories.findIndex((c) => c.name === toName);
      if (fromIdx !== -1 && toIdx !== -1) reorderCategories(fromIdx, toIdx);
      return;
    }

    if (typeof active.id === "number" && typeof over.id === "number") {
      // ドラッグ中ではなく、落とした時点で落とした先のカテゴリに移す
      const activeItem = items.find((i) => i.id === active.id);
      const overItem = items.find((i) => i.id === over.id);
      if (activeItem && overItem && activeItem.category !== overItem.category) {
        updateItemCategory(activeItem.id, overItem.category);
      }
      onItemReorder(active.id, over.id);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={(event: DragStartEvent) => {
        if (typeof event.active.id === "number") setActiveId(event.active.id);
      }}
      onDragCancel={() => setActiveId(null)}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay>
        {activeId != null && (() => {
          const item = items.find((i) => i.id === activeId);
          if (!item) return null;
          return (
            // 見た目は GroceryList のアイテム行に合わせる
            <li className="flex items-stretch bg-base-100 rounded-box shadow-lg opacity-90 select-none">
              <div className="flex flex-1 items-center gap-3 px-4 py-3 min-w-0">
                <Icon
                  icon={mode === "shopping" ? "mdi:check-circle-outline" : "mdi:cart-plus"}
                  className="size-5 text-base-content/30 shrink-0"
                />
                <div className="min-w-0">
                  <div className="truncate">{item.name}</div>
                </div>
              </div>
              <div className="flex w-9 items-center justify-center">
                <Icon icon="mdi:dots-vertical" className="size-5" />
              </div>
              <div className="flex w-9 items-center justify-center pr-1 cursor-grab">
                <Icon icon="mdi:drag-horizontal-variant" className="size-4 text-base-content/30" />
              </div>
            </li>
          );
        })()}
      </DragOverlay>
    </DndContext>
  );
}
