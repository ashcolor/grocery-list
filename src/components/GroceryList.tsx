import { useState, useCallback, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import type { GroceryItem, NamedItem } from "../types";
import { useGrocery } from "../context/GroceryContext";
import { ItemEditSheet } from "./ItemEditSheet";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface GroceryListProps {
  items: GroceryItem[];
  mode: "shopping" | "outOfStock";
  emptyMessage: React.ReactNode;
  editingNewId: number | null;
  onItemClick: (id: number, options?: { silent?: boolean }) => void;
  onItemRemove: (id: number) => void;
  onAddToCategory: (category: string) => void;
  onEditNewComplete: (id: number, name: string) => string | null;
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

function groupByCategory(items: GroceryItem[], categories: NamedItem[]) {
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
  onConfirm: (name: string) => string | null;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const blurIsCancel = useRef(false);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const handleConfirm = () => {
    const name = value.trim();
    if (name) {
      const err = onConfirm(name);
      if (err) {
        setError(err);
        blurIsCancel.current = true;
        ref.current?.focus();
        return;
      }
    } else {
      onCancel();
    }
  };

  return (
    <div className="flex-1 w-full">
      <input
        ref={ref}
        type="text"
        className={`input input-sm w-full ${error ? "input-error" : ""}`}
        placeholder="アイテム名..."
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (error) setError(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleConfirm();
          if (e.key === "Escape") onCancel();
        }}
        onBlur={() => {
          if (blurIsCancel.current) {
            blurIsCancel.current = false;
            return;
          }
          handleConfirm();
        }}
      />
      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
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
        className="pl-4 pr-0 py-4 pb-2 text-xs tracking-wide select-none border-b border-base-300 bg-base-100"
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
  onEditNewComplete: (id: number, name: string) => string | null;
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
  onAddToCategory,
  onEditNewComplete,
  onEditNewCancel,
}: GroceryListProps) {
  const { categories, updateItemCategory, locations, updateItemLocation, storageLocations, updateItemStorageLocation, updateItemName } = useGrocery();
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [dismissingId, setDismissingId] = useState<number | null>(null);
  const [checkedId, setCheckedId] = useState<number | null>(null);
  const pendingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstItemRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

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

  useEffect(() => {
    if (!hasScrolled.current && firstItemRef.current && items.length > 0) {
      firstItemRef.current.scrollIntoView({ block: "start" });
      hasScrolled.current = true;
    }
  }, [items.length]);

  if (items.length === 0 && editingNewId === null) {
    return (
      <div className="text-center text-base-content/50 py-8 space-y-2">{emptyMessage}</div>
    );
  }

  const grouped = groupByCategory(items, categories);
  const namedEntries = [...grouped.entries()].filter(([cat]) => cat !== UNSET_CATEGORY);
  const unsetGroup = grouped.get(UNSET_CATEGORY);
  const catSortableIds = namedEntries.map(([cat]) => `cat-${cat}`);

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
      <SortableContext items={catSortableIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-4 pt-4 pb-40">
          <div className="text-base-content/30 text-sm select-none space-y-2 py-4 px-2 leading-relaxed">
            {mode === "shopping" ? (<>
              <p>タップで購入済みへ</p>
              <p><Icon icon="mdi:cog" className="inline size-4" /> からお店やカテゴリを登録可</p>
            </>) : (<>
              <p>タップで「<Icon icon="mdi:cart-outline" className="inline size-4" /> お買いもの」リストへ</p>
              <p><Icon icon="mdi:cog" className="inline size-4" /> からお店やカテゴリを登録可</p>
            </>)}
          </div>
          <div ref={firstItemRef} />
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
              <li className="pl-4 pr-0 py-4 pb-2 text-xs tracking-wide select-none border-b border-base-300 bg-base-100">
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

      {editingItem && (
        <ItemEditSheet
          item={editingItem}
          categories={categories}
          locations={locations}
          storageLocations={storageLocations}
          onUpdateName={updateItemName}
          onUpdateCategory={updateItemCategory}
          onUpdateLocation={updateItemLocation}
          onUpdateStorageLocation={updateItemStorageLocation}
          onRemove={onItemRemove}
          onClose={() => setEditingItem(null)}
        />
      )}
    </>
  );
}
