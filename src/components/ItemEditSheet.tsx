import { useState, useRef } from "react";
import { Icon } from "@iconify/react";
import type { GroceryItem, NamedItem } from "../types";

interface ItemEditSheetProps {
  item: GroceryItem;
  categories: NamedItem[];
  locations: NamedItem[];
  storageLocations: NamedItem[];
  onUpdateName: (id: number, name: string) => void;
  onUpdateCategory: (id: number, category: string) => void;
  onUpdateLocation: (id: number, location: string | undefined) => void;
  onUpdateStorageLocation: (id: number, storageLocation: string | undefined) => void;
  onRemove: (id: number) => void;
  onClose: () => void;
}

function DateHistory({ label, dates }: { label: string; dates?: number[] }) {
  return (
    <div>
      <p className="font-semibold text-base-content/60 mb-1">{label}</p>
      {dates && dates.length > 0 ? (
        <ul className="flex flex-col gap-0.5 text-base-content/50 max-h-28 overflow-y-auto">
          {[...dates].reverse().map((ts) => (
            <li key={ts}>{new Date(ts).toLocaleString("ja-JP")}</li>
          ))}
        </ul>
      ) : (
        <p className="text-base-content/30">記録なし</p>
      )}
    </div>
  );
}

export function ItemEditSheet({
  item: initialItem,
  categories,
  locations,
  storageLocations,
  onUpdateName,
  onUpdateCategory,
  onUpdateLocation,
  onUpdateStorageLocation,
  onRemove,
  onClose,
}: ItemEditSheetProps) {
  const [item, setItem] = useState(initialItem);
  const [sheetDragY, setSheetDragY] = useState(0);
  const sheetDragStart = useRef<number | null>(null);

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
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
              onClose();
            }
            sheetDragStart.current = null;
            setSheetDragY(0);
          }}
        />
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            className="input flex-1 font-bold text-lg min-w-0"
            value={item.name}
            onChange={(e) => setItem({ ...item, name: e.target.value })}
            onBlur={() => {
              const trimmed = item.name.trim();
              if (trimmed) onUpdateName(item.id, trimmed);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
          />
          <button
            className="btn btn-ghost btn-square text-error"
            onClick={() => { onRemove(item.id); onClose(); }}
          >
            <Icon icon="mdi:delete-outline" className="size-6" />
          </button>
        </div>

        <fieldset className="fieldset">
          <label className="fieldset-legend">カテゴリ</label>
          <select
            className="select w-full"
            value={item.category}
            onChange={(e) => {
              const cat = e.target.value;
              onUpdateCategory(item.id, cat);
              setItem({ ...item, category: cat });
            }}
          >
            <option value="">🏷️ その他</option>
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>{cat.emoji} {cat.name}</option>
            ))}
          </select>
        </fieldset>

        {locations.length > 0 && (
          <fieldset className="fieldset mt-2">
            <label className="fieldset-legend">店</label>
            <select
              className="select w-full"
              value={item.location ?? ""}
              onChange={(e) => {
                const loc = e.target.value || undefined;
                onUpdateLocation(item.id, loc);
                setItem({ ...item, location: loc });
              }}
            >
              <option value="">未設定</option>
              {locations.map((loc) => (
                <option key={loc.name} value={loc.name}>{loc.emoji} {loc.name}</option>
              ))}
            </select>
          </fieldset>
        )}

        {storageLocations.length > 0 && (
          <fieldset className="fieldset mt-2">
            <label className="fieldset-legend">保管場所</label>
            <select
              className="select w-full"
              value={item.storageLocation ?? ""}
              onChange={(e) => {
                const loc = e.target.value || undefined;
                onUpdateStorageLocation(item.id, loc);
                setItem({ ...item, storageLocation: loc });
              }}
            >
              <option value="">未設定</option>
              {storageLocations.map((loc) => (
                <option key={loc.name} value={loc.name}>{loc.emoji} {loc.name}</option>
              ))}
            </select>
          </fieldset>
        )}

        <div className="mt-4 flex flex-col gap-3 text-sm">
          <DateHistory label="最終購入日" dates={item.purchaseDates} />
          <DateHistory label="なくなった日" dates={item.outOfStockDates} />
        </div>

        <div className="mt-6">
          <button className="btn btn-block" onClick={onClose}>閉じる</button>
        </div>
      </div>
    </div>
  );
}
