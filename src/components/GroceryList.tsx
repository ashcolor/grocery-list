import { useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import { type GroceryItem, type CategoryDef } from "../context/GroceryContext";
import { useGrocery } from "../context/GroceryContext";
import {
  DndContext,
  closestCenter,
  pointerWithin,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  DragOverlay,
  type CollisionDetection,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRef, useEffect } from "react";

interface GroceryListProps {
  items: GroceryItem[];
  mode: "shopping" | "outOfStock";
  emptyMessage: string;
  editingNewId: number | null;
  onItemClick: (id: number, options?: { silent?: boolean }) => void;
  onItemRemove: (id: number) => void;
  onItemReorder: (fromId: number, toId: number) => void;
  onAddToCategory: (category: string) => void;
  onEditNewComplete: (id: number, name: string) => void;
  onEditNewCancel: (id: number) => void;
}

function relativeDate(ts: number): string {
  const days = Math.floor((Date.now() - ts) / 86400000);
  if (days < 1) return "最近";
  if (days < 30) return `${days}日前`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}ヶ月前`;
  return `${Math.floor(months / 12)}年前`;
}

const UNSET_CATEGORY = "";
const UNSET_LABEL = "その他";
const UNSET_EMOJI = "🏷️";

function groupByCategory(items: GroceryItem[], categories: CategoryDef[]) {
  const grouped = new Map<string, { emoji: string; items: GroceryItem[] }>();
  for (const cat of categories) {
    const catItems = items.filter((item) => item.category === cat.name);
    if (catItems.length > 0) {
      grouped.set(cat.name, { emoji: cat.emoji, items: catItems });
    }
  }
  const unset = items.filter((item) => !item.category);
  if (unset.length > 0) {
    grouped.set(UNSET_CATEGORY, { emoji: UNSET_EMOJI, items: unset });
  }
  return grouped;
}

function InlineInput({
  onConfirm,
  onCancel,
}: {
  onConfirm: (name: string) => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const handleConfirm = () => {
    const name = value.trim();
    if (name) {
      onConfirm(name);
    } else {
      onCancel();
    }
  };

  return (
    <input
      ref={ref}
      type="text"
      className="input input-bordered input-sm flex-1 w-full"
      placeholder="アイテム名..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleConfirm();
        if (e.key === "Escape") onCancel();
      }}
      onBlur={handleConfirm}
    />
  );
}

function SortableCategoryGroup({
  category,
  emoji,
  children,
  onAddToCategory,
}: {
  category: string;
  emoji: string;
  children: React.ReactNode;
  onAddToCategory: (category: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `cat-${category}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ul
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`list bg-base-100 rounded-box shadow-md ${isDragging ? "opacity-50" : ""}`}
    >
      <li
        className="pl-4 pr-0 py-4 pb-2 text-xs tracking-wide select-none border-b border-base-300 bg-base-200"
      >
        <div className="flex items-center justify-between w-full">
          <span>{emoji} {category}</span>
          <div className="flex items-center">
            <button
              className="btn btn-sm btn-ghost btn-circle px-2"
              onClick={(e) => { e.stopPropagation(); onAddToCategory(category); }}
            >
              <Icon icon="mdi:plus" className="size-5" />
            </button>
            <span ref={setActivatorNodeRef} {...listeners} className="touch-none cursor-grab pr-3 pl-2">
              <Icon icon="fa6-solid:grip-lines" className="size-4 text-base-content/30 shrink-0" />
            </span>
          </div>
        </div>
      </li>
      {children}
    </ul>
  );
}

function SortableGroceryItem({
  item,
  mode,
  dismissingId,
  checkedId,
  editingNewId,
  onCheck,
  onEdit,
  onEditNewComplete,
  onEditNewCancel,
}: {
  item: GroceryItem;
  mode: "shopping" | "outOfStock";
  dismissingId: number | null;
  checkedId: number | null;
  editingNewId: number | null;
  onCheck: (id: number) => void;
  onEdit: (item: GroceryItem) => void;
  onEditNewComplete: (id: number, name: string) => void;
  onEditNewCancel: (id: number) => void;
}) {
  const isEditing = editingNewId === item.id;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    setActivatorNodeRef,
  } = useSortable({ id: item.id, disabled: isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isEditing) {
    return (
      <li ref={setNodeRef} style={style} className="list-row" {...attributes}>
        <InlineInput
          onConfirm={(name) => onEditNewComplete(item.id, name)}
          onCancel={() => onEditNewCancel(item.id)}
        />
      </li>
    );
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`flex items-stretch border-b border-base-300 select-none ${
        dismissingId === item.id ? "animate-fade-out-left" : ""
      } ${isDragging ? "opacity-50 z-10" : ""}`}
    >
      <div
        className="flex flex-1 items-center gap-3 px-4 py-3 cursor-pointer min-w-0 active:bg-base-300 transition-colors"
        onClick={() => onCheck(item.id)}
      >
        <Icon
          icon={checkedId === item.id
            ? (mode === "shopping" ? "mdi:check-circle" : "mdi:cart-check")
            : (mode === "shopping" ? "mdi:check-circle-outline" : "mdi:cart-plus")}
          className={`size-5 shrink-0 ${checkedId === item.id ? "text-success" : "text-base-content/30"}`}
        />
        <div className="min-w-0">
          <div className="truncate">{item.name}</div>
          {mode === "outOfStock" && (() => {
            const last = item.purchaseDates?.at(-1);
            if (!last) return null;
            return (
              <div className="text-xs text-base-content/40">
                {(Date.now() - last) < 86400000
                  ? "最近購入した"
                  : `${relativeDate(last)}に購入`}
              </div>
            );
          })()}
        </div>
      </div>
      <div
        className="flex items-center justify-center px-2 cursor-pointer active:bg-base-300 transition-colors"
        onClick={(e) => { e.stopPropagation(); onEdit(item); }}
      >
        <Icon icon="mdi:dots-vertical" className="size-5" />
      </div>
      <div
        ref={setActivatorNodeRef}
        {...listeners}
        className="flex items-center justify-center pr-3 pl-2 touch-none cursor-grab"
      >
        <Icon icon="fa6-solid:grip-lines" className="size-4 text-base-content/30" />
      </div>
    </li>
  );
}

export default function GroceryList({
  items,
  mode,
  emptyMessage,
  editingNewId,
  onItemClick,
  onItemRemove,
  onItemReorder,
  onAddToCategory,
  onEditNewComplete,
  onEditNewCancel,
}: GroceryListProps) {
  const { categories, updateItemCategory, reorderCategories, locations, updateItemLocation, storageLocations, updateItemStorageLocation, updateItemName } = useGrocery();
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [dismissingId, setDismissingId] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [sheetDragY, setSheetDragY] = useState(0);
  const sheetDragStart = useRef<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const collisionDetection: CollisionDetection = useCallback((args) => {
    const within = pointerWithin(args);
    if (within.length > 0) return within;
    // If dragging an item and pointer is outside all droppables, return empty
    if (typeof args.active.id === "number") return [];
    return closestCenter(args);
  }, []);

  const [checkedId, setCheckedId] = useState<number | null>(null);

  const pendingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = useCallback((id: number) => {
    setCheckedId(id);

    pendingRef.current = setTimeout(() => {
      setDismissingId(id);
      setTimeout(() => {
        setCheckedId(null);
        setDismissingId(null);
        pendingRef.current = null;
        onItemClick(id);
      }, 250);
    }, 300);
  }, [onItemClick]);

  if (items.length === 0 && editingNewId === null) {
    return (
      <p className="text-center text-base-content/50 py-8">{emptyMessage}</p>
    );
  }

  const grouped = groupByCategory(items, categories);
  const namedEntries = [...grouped.entries()].filter(([cat]) => cat !== UNSET_CATEGORY);
  const unsetGroup = grouped.get(UNSET_CATEGORY);
  const catSortableIds = namedEntries.map(([cat]) => `cat-${cat}`);

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    if (typeof active.id !== "number" || typeof over.id !== "number") return;

    const activeItem = items.find(i => i.id === active.id);
    const overItem = items.find(i => i.id === over.id);
    if (activeItem && overItem && activeItem.category !== overItem.category) {
      updateItemCategory(active.id as number, overItem.category);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Dropped outside any category → move to unset
    if (!over && typeof active.id === "number") {
      updateItemCategory(active.id, "");
      return;
    }

    if (!over || active.id === over.id) return;

    // Category reorder
    if (typeof active.id === "string" && typeof over.id === "string") {
      const fromName = (active.id as string).slice(4);
      const toName = (over.id as string).slice(4);
      const fromIdx = categories.findIndex(c => c.name === fromName);
      const toIdx = categories.findIndex(c => c.name === toName);
      if (fromIdx !== -1 && toIdx !== -1) reorderCategories(fromIdx, toIdx);
      return;
    }

    // Item reorder
    if (typeof active.id === "number" && typeof over.id === "number") {
      onItemReorder(active.id, over.id);
    }
  };

  const itemList = (catItems: GroceryItem[]) => (
    <SortableContext items={catItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
      {catItems.map((item) => (
        <SortableGroceryItem
          key={item.id}
          item={item}
          mode={mode}
          dismissingId={dismissingId}
          checkedId={checkedId}
          editingNewId={editingNewId}
          onCheck={handleClick}
          onEdit={setEditingItem}
          onEditNewComplete={onEditNewComplete}
          onEditNewCancel={onEditNewCancel}
        />
      ))}
    </SortableContext>
  );

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={(event: DragStartEvent) => {
          if (typeof event.active.id === "number") setActiveId(event.active.id);
        }}
        onDragOver={handleDragOver}
        onDragEnd={(event: DragEndEvent) => {
          setActiveId(null);
          handleDragEnd(event);
        }}
      >
        <SortableContext items={catSortableIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-4 pt-4">
            <div className="text-base-content/30 text-sm select-none space-y-2 py-4 px-2 leading-relaxed">
              {mode === "shopping" ? (<>
                <p>タップで購入済みへ</p>
                <p><Icon icon="mdi:cog" className="inline size-4" /> からお店やカテゴリを登録可</p>
              </>) : (<>
                <p>タップで「<Icon icon="mdi:cart-outline" className="inline size-4" /> お買いもの」リストへ</p>
                <p><Icon icon="mdi:cog" className="inline size-4" /> からお店やカテゴリを登録可</p>
              </>)}
            </div>
            {namedEntries.map(([category, { emoji, items: catItems }]) => (
              <SortableCategoryGroup
                key={category}
                category={category}
                emoji={emoji}
                onAddToCategory={onAddToCategory}
              >
                {itemList(catItems)}
              </SortableCategoryGroup>
            ))}
            {unsetGroup && (
              <ul className="list bg-base-100 rounded-box shadow-md">
                <li className="p-4 pb-2 text-xs tracking-wide select-none">
                  <div className="flex items-center justify-between w-full">
                    <span>{UNSET_EMOJI} {UNSET_LABEL}</span>
                    <button
                      className="btn btn-xs btn-ghost btn-circle"
                      onClick={(e) => { e.stopPropagation(); onAddToCategory(UNSET_CATEGORY); }}
                    >
                      <Icon icon="mdi:plus" className="size-4" />
                    </button>
                  </div>
                </li>
                {itemList(unsetGroup.items)}
              </ul>
            )}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeId != null && (() => {
            const item = items.find(i => i.id === activeId);
            if (!item) return null;
            return (
              <li className="flex items-stretch bg-base-100 rounded-box shadow-lg opacity-90 select-none">
                <div className="flex flex-1 items-center gap-3 px-4 py-3 min-w-0">
                  <Icon icon="mdi:check-circle-outline" className="size-5 text-base-content/30 shrink-0" />
                  <div className="min-w-0">
                    <div className="truncate">{item.name}</div>
                  </div>
                </div>
                <div className="flex items-center justify-center px-2">
                  <Icon icon="mdi:dots-vertical" className="size-5" />
                </div>
                <div className="flex items-center justify-center pr-3 pl-2 cursor-grab">
                  <Icon icon="fa6-solid:grip-lines" className="size-4 text-base-content/30" />
                </div>
              </li>
            );
          })()}
        </DragOverlay>
      </DndContext>

      {editingItem && (
        <div className="fixed inset-0 z-50" onClick={() => setEditingItem(null)}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-base-100 rounded-t-2xl p-6 pb-8 max-h-[80vh] overflow-y-auto"
            style={{
              transform: `translateY(${sheetDragY}px)`,
              transition: sheetDragStart.current != null ? "none" : "transform 0.25s ease-out",
              animation: sheetDragStart.current != null ? "none" : undefined,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-10 h-1 bg-base-300 rounded-full mx-auto mb-4 cursor-grab touch-none"
              onPointerDown={(e) => {
                sheetDragStart.current = e.clientY;
                setSheetDragY(0);
                (e.target as HTMLElement).setPointerCapture(e.pointerId);
              }}
              onPointerMove={(e) => {
                if (sheetDragStart.current == null) return;
                const dy = e.clientY - sheetDragStart.current;
                setSheetDragY(Math.max(0, dy));
              }}
              onPointerUp={() => {
                if (sheetDragStart.current == null) return;
                if (sheetDragY > 100) {
                  setEditingItem(null);
                }
                sheetDragStart.current = null;
                setSheetDragY(0);
              }}
            />
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                className="input input-bordered flex-1 font-bold text-lg min-w-0"
                value={editingItem.name}
                onChange={(e) => {
                  setEditingItem({ ...editingItem, name: e.target.value });
                }}
                onBlur={() => {
                  const trimmed = editingItem.name.trim();
                  if (trimmed) {
                    updateItemName(editingItem.id, trimmed);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    (e.target as HTMLInputElement).blur();
                  }
                }}
              />
              <button
                className="btn btn-ghost btn-square text-error"
                onClick={() => {
                  onItemRemove(editingItem.id);
                  setEditingItem(null);
                }}
              >
                <Icon icon="mdi:delete-outline" className="size-6" />
              </button>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">カテゴリ</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={editingItem.category}
                onChange={(e) => {
                  const cat = e.target.value;
                  updateItemCategory(editingItem.id, cat);
                  setEditingItem({ ...editingItem, category: cat });
                }}
              >
                <option value="">{UNSET_EMOJI} {UNSET_LABEL}</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>{cat.emoji} {cat.name}</option>
                ))}
              </select>
            </div>
            {locations.length > 0 && (
              <div className="form-control mt-2">
                <label className="label">
                  <span className="label-text">店</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={editingItem.location ?? ""}
                  onChange={(e) => {
                    const loc = e.target.value || undefined;
                    updateItemLocation(editingItem.id, loc);
                    setEditingItem({ ...editingItem, location: loc });
                  }}
                >
                  <option value="">未設定</option>
                  {locations.map((loc) => (
                    <option key={loc.name} value={loc.name}>{loc.emoji} {loc.name}</option>
                  ))}
                </select>
              </div>
            )}
            {storageLocations.length > 0 && (
              <div className="form-control mt-2">
                <label className="label">
                  <span className="label-text">保管場所</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={editingItem.storageLocation ?? ""}
                  onChange={(e) => {
                    const loc = e.target.value || undefined;
                    updateItemStorageLocation(editingItem.id, loc);
                    setEditingItem({ ...editingItem, storageLocation: loc });
                  }}
                >
                  <option value="">未設定</option>
                  {storageLocations.map((loc) => (
                    <option key={loc.name} value={loc.name}>{loc.emoji} {loc.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="mt-4 flex flex-col gap-3 text-sm">
              <div>
                <p className="font-semibold text-base-content/60 mb-1">最終購入日</p>
                {editingItem.purchaseDates && editingItem.purchaseDates.length > 0 ? (
                  <ul className="flex flex-col gap-0.5 text-base-content/50 max-h-28 overflow-y-auto">
                    {[...editingItem.purchaseDates].reverse().map((ts) => (
                      <li key={ts}>{new Date(ts).toLocaleString("ja-JP")}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-base-content/30">記録なし</p>
                )}
              </div>
              <div>
                <p className="font-semibold text-base-content/60 mb-1">なくなった日</p>
                {editingItem.outOfStockDates && editingItem.outOfStockDates.length > 0 ? (
                  <ul className="flex flex-col gap-0.5 text-base-content/50 max-h-28 overflow-y-auto">
                    {[...editingItem.outOfStockDates].reverse().map((ts) => (
                      <li key={ts}>{new Date(ts).toLocaleString("ja-JP")}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-base-content/30">記録なし</p>
                )}
              </div>
            </div>
            <div className="mt-6">
              <button className="btn btn-block" onClick={() => setEditingItem(null)}>
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
