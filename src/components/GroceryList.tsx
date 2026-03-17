import { useState, useRef, useCallback } from "react";
import { CATEGORIES, type GroceryItem, type Category } from "../context/GroceryContext";
import { useGrocery } from "../context/GroceryContext";

interface GroceryListProps {
  items: GroceryItem[];
  emptyMessage: string;
  onItemClick: (id: number) => void;
  onItemRemove: (id: number) => void;
}

function groupByCategory(items: GroceryItem[]) {
  const grouped = new Map<Category, GroceryItem[]>();
  for (const cat of CATEGORIES) {
    const catItems = items.filter((item) => (item.category ?? "その他") === cat);
    if (catItems.length > 0) {
      grouped.set(cat, catItems);
    }
  }
  return grouped;
}

export default function GroceryList({
  items,
  emptyMessage,
  onItemClick,
  onItemRemove,
}: GroceryListProps) {
  const { updateItemCategory } = useGrocery();
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [dismissingId, setDismissingId] = useState<number | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  const startLongPress = useCallback((item: GroceryItem) => {
    longPressTriggered.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      setEditingItem(item);
    }, 500);
  }, []);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleClick = useCallback((id: number) => {
    if (longPressTriggered.current) return;
    setDismissingId(id);
    setTimeout(() => {
      setDismissingId(null);
      onItemClick(id);
    }, 250);
  }, [onItemClick]);

  if (items.length === 0) {
    return (
      <p className="text-center text-base-content/50 py-8">{emptyMessage}</p>
    );
  }

  const grouped = groupByCategory(items);

  return (
    <>
      <div className="flex flex-col gap-4">
        {[...grouped.entries()].map(([category, catItems]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-base-content/60 mb-2 px-1">
              {category}
            </h3>
            <ul className="flex flex-col gap-2">
              {catItems.map((item) => (
                <li
                  key={item.id}
                  className={`flex items-center gap-3 bg-base-100 rounded-lg px-4 py-3 shadow-sm cursor-pointer active:bg-base-300 transition-colors select-none ${dismissingId === item.id ? "animate-fade-out-left" : ""}`}
                  onClick={() => handleClick(item.id)}
                  onPointerDown={() => startLongPress(item)}
                  onPointerUp={cancelLongPress}
                  onPointerLeave={cancelLongPress}
                >
                  <span className="flex-1">{item.name}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {editingItem && (
        <dialog className="modal modal-open" onClick={() => setEditingItem(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">{editingItem.name}</h3>
            <div className="form-control gap-2">
              <label className="label">
                <span className="label-text">カテゴリ</span>
              </label>
              {CATEGORIES.map((cat) => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    className="radio"
                    name="category"
                    checked={(editingItem.category ?? "その他") === cat}
                    onChange={() => {
                      updateItemCategory(editingItem.id, cat);
                      setEditingItem({ ...editingItem, category: cat });
                    }}
                  />
                  <span>{cat}</span>
                </label>
              ))}
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
