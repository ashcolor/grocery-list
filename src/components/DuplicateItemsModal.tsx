import { useMemo, useState } from "react";
import { useGrocery } from "../context/GroceryContext";
import type { GroceryItem } from "../types";

type Entry = { item: GroceryItem; list: "shopping" | "outOfStock" };

/** 最後に購入した日時。購入履歴がなければ 0 */
function lastPurchased(item: GroceryItem): number {
  return item.purchaseDates?.at(-1) ?? 0;
}

/** 同名アイテムが既にある場合に表示し、重複をまとめて削除できるようにする */
export function DuplicateItemsModal() {
  const { shoppingItems, outOfStockItems, removeShoppingItem, removeOutOfStockItem } = useGrocery();
  const [dismissed, setDismissed] = useState(false);

  // 同名ごとにまとめ、先頭が「残すもの」（最後に購入したもの。同じなら新しい方）になるよう並べる
  const groups = useMemo(() => {
    const map = new Map<string, Entry[]>();
    const add = (item: GroceryItem, list: Entry["list"]) => {
      const key = item.name.trim().toLowerCase();
      map.set(key, [...(map.get(key) ?? []), { item, list }]);
    };
    shoppingItems.forEach((i) => add(i, "shopping"));
    outOfStockItems.forEach((i) => add(i, "outOfStock"));
    return [...map.values()]
      .filter((entries) => entries.length > 1)
      .map((entries) =>
        [...entries].sort(
          (a, b) => lastPurchased(b.item) - lastPurchased(a.item) || b.item.id - a.item.id,
        ),
      );
  }, [shoppingItems, outOfStockItems]);

  if (dismissed || groups.length === 0) return null;

  const extraCount = groups.reduce((sum, entries) => sum + entries.length - 1, 0);

  const remove = (entry: Entry) =>
    entry.list === "shopping" ? removeShoppingItem(entry.item.id) : removeOutOfStockItem(entry.item.id);

  const removeAllDuplicates = () => {
    groups.forEach((entries) => entries.slice(1).forEach(remove));
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="text-lg font-bold">重複しているアイテム</h3>
        <p className="mt-2 text-sm leading-relaxed opacity-80">
          同じ名前のアイテムがあります。最後に購入したものを残して、ほかを削除できます。
        </p>

        <div className="mt-3 max-h-80 space-y-3 overflow-y-auto">
          {groups.map((entries) => (
            <ul key={entries[0].item.name.trim().toLowerCase()} className="list bg-base-200 rounded-box">
              {entries.map((entry, index) => (
                <li key={`${entry.list}-${entry.item.id}`} className="flex items-center gap-2 px-4 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{entry.item.name}</div>
                    <div className="text-xs text-base-content/50">
                      {entry.list === "shopping" ? "買いもの" : "なくなった"}
                      {entry.item.category ? ` ・ ${entry.item.category}` : ""}
                    </div>
                  </div>
                  <span className={`badge badge-sm ${index === 0 ? "badge-success" : "badge-ghost"}`}>
                    {index === 0 ? "残す" : "削除"}
                  </span>
                </li>
              ))}
            </ul>
          ))}
        </div>

        <div className="modal-action">
          <button type="button" className="btn btn-sm" onClick={() => setDismissed(true)}>
            あとで
          </button>
          <button type="button" className="btn btn-sm btn-error" onClick={removeAllDuplicates}>
            まとめて削除（{extraCount}件）
          </button>
        </div>
      </div>
    </div>
  );
}
