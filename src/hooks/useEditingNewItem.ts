import { useState, useCallback } from "react";

interface UseEditingNewItemOptions {
  addItem: (name: string, category?: string, ...rest: (string | undefined)[]) => number;
  updateItemName: (id: number, name: string) => void;
  removeItem: (id: number) => void;
  /** Extra args to pass after category when adding */
  extraAddArgs?: (string | undefined)[];
}

export function useEditingNewItem({
  addItem,
  updateItemName,
  removeItem,
  extraAddArgs = [],
}: UseEditingNewItemOptions) {
  const [editingNewId, setEditingNewId] = useState<number | null>(null);

  const handleAdd = useCallback((category?: string) => {
    if (editingNewId !== null) return;
    const id = addItem("", category, ...extraAddArgs);
    setEditingNewId(id);
  }, [editingNewId, addItem, extraAddArgs]);

  const handleEditComplete = useCallback((id: number, name: string) => {
    updateItemName(id, name);
    setEditingNewId(null);
  }, [updateItemName]);

  const handleEditCancel = useCallback((id: number) => {
    removeItem(id);
    setEditingNewId(null);
  }, [removeItem]);

  return { editingNewId, handleAdd, handleEditComplete, handleEditCancel };
}
