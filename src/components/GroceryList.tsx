import { useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import { type GroceryItem, type CategoryDef } from "../context/GroceryContext";
import { useGrocery } from "../context/GroceryContext";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
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
  onItemClick: (id: number) => void;
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
        ref={setActivatorNodeRef}
        {...listeners}
        className="p-4 pb-2 text-xs tracking-wide select-none cursor-grab touch-none"
      >
        <div className="flex items-center justify-between w-full">
          <span>{emoji} {category}</span>
          <button
            className="btn btn-xs btn-ghost btn-circle"
            onClick={(e) => { e.stopPropagation(); onAddToCategory(category); }}
          >
            <Icon icon="mdi:plus" className="size-4" />
          </button>
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
  editingNewId,
  onCheck,
  onEdit,
  onEditNewComplete,
  onEditNewCancel,
}: {
  item: GroceryItem;
  mode: "shopping" | "outOfStock";
  dismissingId: number | null;
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
      {...listeners}
      className={`list-row cursor-pointer active:bg-base-300 transition-colors select-none ${
        dismissingId === item.id ? "animate-fade-out-left" : ""
      } ${isDragging ? "opacity-50 z-10" : ""}`}
    >
      <button
        className="btn btn-square btn-ghost btn-sm"
        onClick={() => onCheck(item.id)}
      >
        <Icon icon="mdi:check" className="size-5" />
      </button>
      <div>
        <div>{item.name}</div>
        {(() => {
          const dates = mode === "shopping" ? item.outOfStockDates : item.purchaseDates;
          const last = dates?.at(-1);
          if (!last) return null;
          return (
            <div className="text-xs text-base-content/40">
              {last && (Date.now() - last) < 86400000
                ? `最近${mode === "shopping" ? "なくなった" : "購入した"}`
                : `${relativeDate(last)}に${mode === "shopping" ? "なくなった" : "購入"}`}
            </div>
          );
        })()}
      </div>
      <button
        className="btn btn-square btn-ghost btn-sm"
        onClick={(e) => { e.stopPropagation(); onEdit(item); }}
      >
        <Icon icon="mdi:dots-vertical" className="size-5" />
      </button>
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
  const { categories, updateItemCategory, reorderCategories, locations, updateItemLocation } = useGrocery();
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [dismissingId, setDismissingId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleClick = useCallback((id: number) => {
    setDismissingId(id);
    setTimeout(() => {
      setDismissingId(null);
      onItemClick(id);
    }, 250);
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
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
      const activeItem = items.find(i => i.id === active.id);
      const overItem = items.find(i => i.id === over.id);
      if (activeItem && overItem && activeItem.category !== overItem.category) {
        updateItemCategory(active.id, overItem.category);
      }
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
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={catSortableIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-4">
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
      </DndContext>

      {editingItem && (
        <dialog className="modal modal-open" onClick={() => setEditingItem(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">{editingItem.name}</h3>
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
                  <span className="label-text">場所</span>
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
                    <option key={loc} value={loc}>{loc}</option>
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
            <div className="modal-action">
              <button
                className="btn btn-error"
                onClick={() => {
                  onItemRemove(editingItem.id);
                  setEditingItem(null);
                }}
              >
                削除
              </button>
              <button className="btn" onClick={() => setEditingItem(null)}>
                閉じる
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
