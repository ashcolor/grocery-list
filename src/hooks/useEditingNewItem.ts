import { useState, useCallback, useEffect, useRef } from "react";
import type { GroceryItem } from "../types";

interface UseEditingNewItemOptions {
  addItem: (name: string, category?: string, ...rest: (string | undefined)[]) => number;
  updateItemName: (id: number, name: string) => void;
  removeItem: (id: number) => void;
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
  updateItemName,
  removeItem,
  extraAddArgs = [],
  currentItems,
  otherItems,
  moveFromOther,
  showToast,
}: UseEditingNewItemOptions) {
  const [editingNewId, setEditingNewId] = useState<number | null>(null);
  const editingNewIdRef = useRef<number | null>(null);

  useEffect(() => {
    editingNewIdRef.current = editingNewId;
  }, [editingNewId]);

  // Clean up placeholder item on unmount
  useEffect(() => {
    return () => {
      if (editingNewIdRef.current !== null) {
        removeItem(editingNewIdRef.current);
      }
    };
  }, [removeItem]);

  const handleAdd = useCallback(
    (category?: string) => {
      if (editingNewId !== null) return;
      const id = addItem("", category, ...extraAddArgs);
      setEditingNewId(id);
    },
    [editingNewId, addItem, extraAddArgs],
  );

  const handleEditComplete = useCallback(
    (id: number, name: string): string | null => {
      // Check if an item with the same name already exists in the current list
      if (currentItems) {
        const duplicate = currentItems.find(
          (item) => item.id !== id && item.name.toLowerCase() === name.toLowerCase(),
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
          // Remove the placeholder item and move the existing one instead
          removeItem(id);
          moveFromOther(existing.id);
          setEditingNewId(null);
          return null;
        }
      }
      updateItemName(id, name);
      setEditingNewId(null);
      return null;
    },
    [updateItemName, removeItem, currentItems, otherItems, moveFromOther, showToast],
  );

  const handleEditCancel = useCallback(
    (id: number) => {
      removeItem(id);
      setEditingNewId(null);
    },
    [removeItem],
  );

  return { editingNewId, handleAdd, handleEditComplete, handleEditCancel };
}
