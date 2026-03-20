import { useCallback } from "react";
import type { NamedItem, GroceryItem } from "../types";
import { useLocalStorage } from "./useLocalStorage";

type ItemSetter = React.Dispatch<React.SetStateAction<GroceryItem[]>>;

interface UseNamedItemListOptions {
  storageKey: string;
  defaultValue: NamedItem[];
  /** Which GroceryItem field references this named item */
  itemField: "category" | "location" | "storageLocation";
  /** Setters for both item lists, so renaming/removing propagates */
  itemSetters: ItemSetter[];
  migrate?: (raw: unknown) => NamedItem[];
}

export function useNamedItemList({
  storageKey,
  defaultValue,
  itemField,
  itemSetters,
  migrate,
}: UseNamedItemListOptions) {
  const [items, setItems] = useLocalStorage<NamedItem[]>(storageKey, defaultValue, migrate);

  const add = useCallback((item: NamedItem) => {
    setItems((prev) => prev.some((i) => i.name === item.name) ? prev : [...prev, item]);
  }, [setItems]);

  const remove = useCallback((name: string) => {
    setItems((prev) => prev.filter((i) => i.name !== name));
    const fallback = itemField === "category" ? "" : undefined;
    for (const setter of itemSetters) {
      setter((prev) =>
        prev.map((item) =>
          item[itemField] === name ? { ...item, [itemField]: fallback } : item,
        ),
      );
    }
  }, [setItems, itemField, itemSetters]);

  const update = useCallback((oldName: string, updated: NamedItem) => {
    setItems((prev) => prev.map((i) => (i.name === oldName ? updated : i)));
    if (oldName !== updated.name) {
      for (const setter of itemSetters) {
        setter((prev) =>
          prev.map((item) =>
            item[itemField] === oldName ? { ...item, [itemField]: updated.name } : item,
          ),
        );
      }
    }
  }, [setItems, itemField, itemSetters]);

  const reorder = useCallback((fromIdx: number, toIdx: number) => {
    setItems((prev) => {
      const next = [...prev];
      const [item] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, item);
      return next;
    });
  }, [setItems]);

  return { items, setItems, add, remove, update, reorder };
}
