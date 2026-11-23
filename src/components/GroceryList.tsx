import { useState, useCallback, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import type { GroceryItem, NamedItem } from "../types";
import { useGrocery } from "../context/GroceryContext";
import { ItemEditSheet } from "./ItemEditSheet";
import { LocationCard } from "./LocationCard";
import type { AddError } from "../hooks/useEditingNewItem";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface GroceryListProps {
  items: GroceryItem[];
  mode: "shopping" | "outOfStock";
  editingNewCategory: string | null;
  onItemClick: (id: number, options?: { silent?: boolean }) => void;
  onItemRemove: (id: number) => void;
  onAddToCategory: (category: string) => void;
  onEditNewComplete: (name: string) => AddError | null;
  onEditNewCancel: () => void;
  /** Items from the other list for suggestions */
  suggestItems?: GroceryItem[];
  /** リストの先頭に表示する画像（店の会員カードなど） */
  headerImage?: string;
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
  suggestItems = [],
}: {
  onConfirm: (name: string) => AddError | null;
  onCancel: () => void;
  suggestItems?: GroceryItem[];
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState<AddError | null>(null);
  const skipBlur = useRef(false);

  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
    // 画面下の Dock に隠れないよう、入力欄を画面の中央に持ってくる。
    // スマホではキーボードが出て表示領域が縮むので、出きったあとにもう一度合わせる
    const center = () => ref.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    center();
    const timer = setTimeout(center, 350);
    return () => clearTimeout(timer);
  }, []);

  const normalize = (s: string) =>
    s.toLowerCase().replace(/[\u3041-\u3096]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) + 0x60));
  const trimmed = normalize(value.trim());
  const suggestions = trimmed
    ? suggestItems.filter((item) => normalize(item.name).includes(trimmed)).slice(0, 5)
    : [];

  const handleConfirm = (name?: string) => {
    const finalName = name ?? value.trim();
    if (finalName) {
      const err = onConfirm(finalName);
      if (err) {
        setError(err);
        // blur から呼ばれたときも入力を続けられるよう、フォーカスを戻す
        setTimeout(() => ref.current?.focus(), 0);
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
        type="search"
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
          if (skipBlur.current) {
            skipBlur.current = false;
            return;
          }
          // エラーを見せたあとにもう一度外をタップしたら、入力をやめる
          if (error) {
            onCancel();
            return;
          }
          handleConfirm();
        }}
      />
      {error && (
        <div className="mt-2 flex items-center gap-2">
          <p className="text-error text-xs flex-1">{error.message}</p>
          {error.action && (
            <button
              type="button"
              className="btn btn-xs btn-primary"
              onPointerDown={(e) => {
                // 入力欄のフォーカスを外さない（blur で入力が閉じないように）
                e.preventDefault();
                skipBlur.current = true;
              }}
              onClick={() => {
                skipBlur.current = false;
                error.action!.run();
              }}
            >
              {error.action.label}
            </button>
          )}
        </div>
      )}
      {suggestions.length > 0 && (
        <ul className="mt-1 rounded-box bg-base-100 text-base border border-base-300">
          {suggestions.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="w-full text-left px-4 py-3 hover:bg-base-300 active:bg-base-300 rounded-box"
                onPointerDown={(e) => {
                  e.preventDefault();
                  skipBlur.current = true;
                }}
                onClick={() => handleConfirm(item.name)}
              >
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      )}
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
      className={`list bg-base-100 rounded-box border border-base-300 ${isDragging ? "opacity-50" : ""}`}
    >
      <li
        className="pl-4 pr-0 py-1.5 select-none border-b border-base-300 bg-base-200"
      >
        <div className="flex items-center justify-between w-full">
          {/* アイテム行と同じく、アイコン幅（size-5）+ gap-3 で名前の開始位置を揃える */}
          <span className="flex min-w-0 items-center gap-3">
            <span className="w-5 shrink-0 text-center">{emoji}</span>
            <span className="truncate text-base-content/60">{category}</span>
          </span>
          <div className="flex items-center">
            {/* アイテム行のメニュー・ドラッグ列と同じ幅（w-9）にして縦に揃える */}
            <div className="flex w-9 justify-center">
              <button
                className="btn btn-xs btn-ghost btn-circle"
                onClick={(e) => { e.stopPropagation(); onAddToCategory(category); }}
              >
                <Icon icon="mdi:plus" className="size-5" />
              </button>
            </div>
            <span ref={setActivatorNodeRef} {...listeners} className="flex w-9 justify-center touch-none cursor-grab pr-1">
              <Icon icon="mdi:drag-horizontal-variant" className="size-4 text-base-content/30 shrink-0" />
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
  dismissing,
  checked,
  onCheck,
  onEdit,
}: {
  item: GroceryItem;
  mode: "shopping" | "outOfStock";
  dismissing: boolean;
  checked: boolean;
  onCheck: (id: number) => void;
  onEdit: (item: GroceryItem) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    setActivatorNodeRef,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`flex items-stretch border-b border-base-300 last:border-b-0 select-none ${
        dismissing ? "animate-fade-out-left" : ""
      } ${isDragging ? "opacity-50 z-10" : ""}`}
    >
      <div
        className="flex flex-1 items-center gap-3 px-4 py-3 cursor-pointer min-w-0 active:bg-base-300 transition-colors"
        onClick={() => onCheck(item.id)}
      >
        <Icon
          icon={checked
            ? (mode === "shopping" ? "mdi:check-circle" : "mdi:cart-check")
            : (mode === "shopping" ? "mdi:check-circle-outline" : "mdi:cart-plus")}
          className={`size-5 shrink-0 ${checked ? "text-success" : "text-base-content/30"}`}
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
        className="flex w-9 items-center justify-center cursor-pointer active:bg-base-300 transition-colors"
        onClick={(e) => { e.stopPropagation(); onEdit(item); }}
      >
        <Icon icon="mdi:dots-vertical" className="size-5" />
      </div>
      <div
        ref={setActivatorNodeRef}
        {...listeners}
        className="flex w-9 items-center justify-center pr-1 touch-none cursor-grab"
      >
        <Icon icon="mdi:drag-horizontal-variant" className="size-4 text-base-content/30" />
      </div>
    </li>
  );
}

export default function GroceryList({
  items,
  mode,
  editingNewCategory,
  onItemClick,
  onItemRemove,
  onAddToCategory,
  onEditNewComplete,
  onEditNewCancel,
  suggestItems,
  headerImage,
}: GroceryListProps) {
  const {
    categories,
    updateItemCategory,
    locations,
    updateItemLocation,
    storageLocations,
    updateItemStorageLocation,
    updateItemName,
    shoppingItems,
    outOfStockItems,
  } = useGrocery();
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  // お店で次々チェックできるよう、アイテムごとに処理中を管理する
  const [dismissingIds, setDismissingIds] = useState<ReadonlySet<number>>(new Set());
  const [checkedIds, setCheckedIds] = useState<ReadonlySet<number>>(new Set());
  const pendingIds = useRef(new Set<number>());
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  const handleClick = useCallback((id: number) => {
    // 同じアイテムの連打は無視する（別のアイテムは続けて押せる）
    if (pendingIds.current.has(id)) return;
    pendingIds.current.add(id);
    const withId = (prev: ReadonlySet<number>) => new Set(prev).add(id);
    const withoutId = (prev: ReadonlySet<number>) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    };
    setCheckedIds(withId);

    setTimeout(() => {
      setDismissingIds(withId);
      setTimeout(() => {
        setCheckedIds(withoutId);
        setDismissingIds(withoutId);
        pendingIds.current.delete(id);
        onItemClick(id);
      }, 250);
    }, 300);
  }, [onItemClick]);

  /** 名前を変えたときに、ほかのアイテム（両方のリスト）と被らないか */
  const isDuplicateName = useCallback(
    (id: number, name: string) => {
      const key = name.trim().toLowerCase();
      return [...shoppingItems, ...outOfStockItems].some((i) => i.id !== id && i.name.trim().toLowerCase() === key);
    },
    [shoppingItems, outOfStockItems],
  );

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, []);

  useEffect(() => {
    if (!hasScrolled.current && items.length > 0) {
      scrollToBottom();
      hasScrolled.current = true;
    }
  }, [items.length, scrollToBottom]);

  const grouped = groupByCategory(items, categories);
  // 表示は逆順（下から押しやすくするため）。データ順は変えない
  const namedEntries = [...grouped.entries()]
    .filter(([cat]) => cat !== UNSET_CATEGORY)
    .reverse();
  const unsetGroup = grouped.get(UNSET_CATEGORY);
  const catSortableIds = namedEntries.map(([cat]) => `cat-${cat}`);

  const inlineInput = (
    <li className="list-row">
      <InlineInput
        onConfirm={onEditNewComplete}
        onCancel={onEditNewCancel}
        suggestItems={suggestItems}
      />
    </li>
  );

  const itemList = (category: string, catItems: GroceryItem[]) => (
    <SortableContext items={[...catItems].reverse().map(i => i.id)} strategy={verticalListSortingStrategy}>
      {editingNewCategory === category && inlineInput}
      {[...catItems].reverse().map((item) => (
        <SortableGroceryItem
          key={item.id}
          item={item}
          mode={mode}
          dismissing={dismissingIds.has(item.id)}
          checked={checkedIds.has(item.id)}
          onCheck={handleClick}
          onEdit={setEditingItem}
        />
      ))}
    </SortableContext>
  );

  return (
    <>
      <SortableContext items={catSortableIds} strategy={verticalListSortingStrategy}>
        {/* 下の余白は、追加ボタン（3rem）と、その上下に Dock との隙間と同じ 1rem ずつ */}
        <div className="swipe-target flex flex-col justify-end min-h-full gap-4 pt-[60vh] pb-20">
          {/* 画像の読み込みで高さが変わるので、開いたときに一番下へ合わせ直す */}
          {headerImage && <LocationCard image={headerImage} onLoad={scrollToBottom} />}
          {(unsetGroup || editingNewCategory === UNSET_CATEGORY) && (
            <ul className="list bg-base-100 rounded-box border border-base-300">
              <li className="pl-4 pr-0 py-1.5 select-none border-b border-base-300 bg-base-200">
                <div className="flex items-center justify-between w-full">
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="w-5 shrink-0 text-center">{UNSET_EMOJI}</span>
                    <span className="truncate text-base-content/60">{UNSET_LABEL}</span>
                  </span>
                  <div className="flex items-center">
                    <div className="flex w-9 justify-center">
                      <button
                        className="btn btn-xs btn-ghost btn-circle"
                        onClick={(e) => { e.stopPropagation(); onAddToCategory(UNSET_CATEGORY); }}
                      >
                        <Icon icon="mdi:plus" className="size-5" />
                      </button>
                    </div>
                    {/* ドラッグ列の分の空き */}
                    <span className="w-9" />
                  </div>
                </div>
              </li>
              {itemList(UNSET_CATEGORY, unsetGroup?.items ?? [])}
            </ul>
          )}
          {namedEntries.map(([category, { emoji, items: catItems }]) => (
            <SortableCategoryGroup
              key={category}
              category={category}
              emoji={emoji}
              onAddToCategory={onAddToCategory}
            >
              {itemList(category, catItems)}
            </SortableCategoryGroup>
          ))}
        </div>
      </SortableContext>
      <div ref={bottomRef} />

      {editingItem && (
        <ItemEditSheet
          item={editingItem}
          categories={categories}
          locations={locations}
          storageLocations={storageLocations}
          onUpdateName={updateItemName}
          isDuplicateName={isDuplicateName}
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
