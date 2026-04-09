import { useState, useCallback } from "react";
import type { GroceryItem } from "../types";

interface UseEditingNewItemOptions {
  addItem: (name: string, category?: string, ...rest: (string | undefined)[]) => number;
  /** Extra args to pass after category when adding */
  extraAddArgs?: (string | undefined)[];
  /** Items in the current list, to check for same-list duplicates */
  currentItems?: GroceryItem[];
  /** Items in the OTHER list, to check for duplicates */
  otherItems?: GroceryItem[];
  /** Move an item from the other list to this list */
  moveFromOther?: (id: number) => void;
  /** Show toast notification */
  showToast?: (message: string, icon: string) => void;
}

export function useEditingNewItem({
  addItem,
  extraAddArgs = [],
  currentItems,
  otherItems,
  moveFromOther,
  showToast,
}: UseEditingNewItemOptions) {
  const [editingNewCategory, setEditingNewCategory] = useState<string | null>(null);

  const handleAdd = useCallback(
    (category?: string) => {
      if (editingNewCategory !== null) return;
      setEditingNewCategory(category ?? "");
    },
    [editingNewCategory],
  );

  const handleEditComplete = useCallback(
    (name: string): string | null => {
      // Check if an item with the same name already exists in the current list
      if (currentItems) {
        const duplicate = currentItems.find(
          (item) => item.name.toLowerCase() === name.toLowerCase(),
        );
        if (duplicate) {
          const error = `既にリストに存在するアイテム`;
          showToast?.(error, "mdi:alert-circle-outline");
          return error;
        }
      }
      // Check if an item with the same name exists in the other list
      if (otherItems && moveFromOther) {
        const existing = otherItems.find((item) => item.name.toLowerCase() === name.toLowerCase());
        if (existing) {
          moveFromOther(existing.id);
          setEditingNewCategory(null);
          return null;
        }
      }
      addItem(name, editingNewCategory ?? "", ...extraAddArgs);
      setEditingNewCategory(null);
      return null;
    },
    [addItem, editingNewCategory, extraAddArgs, currentItems, otherItems, moveFromOther, showToast],
  );

  const handleEditCancel = useCallback(() => {
    setEditingNewCategory(null);
  }, []);

  return { editingNewCategory, handleAdd, handleEditComplete, handleEditCancel };
}
