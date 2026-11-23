import { useState, useCallback } from "react";
import type { GroceryItem } from "../types";
import { useGrocery } from "../context/GroceryContext";
import { guessCategory } from "../utils/autoCategory";

/** 追加できなかったときのエラー。action があれば、エラーの横にボタンとして出す */
export interface AddError {
  message: string;
  action?: { label: string; run: () => void };
}

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
  /** 選択中のタブ（店・保管場所）に表示されるアイテムか。省略時はすべて表示されている扱い */
  isInCurrentTab?: (item: GroceryItem) => boolean;
  /** アイテムがどのタブにあるか（「🛒 スーパー」など） */
  describeTab?: (item: GroceryItem) => string;
  /** アイテムを選択中のタブに移す */
  moveToCurrentTab?: (item: GroceryItem) => void;
  /** 移すボタンの文言（「ホームセンターに移動」など） */
  moveToCurrentTabLabel?: string;
}

export function useEditingNewItem({
  addItem,
  extraAddArgs = [],
  currentItems,
  otherItems,
  moveFromOther,
  showToast,
  isInCurrentTab,
  describeTab,
  moveToCurrentTab,
  moveToCurrentTabLabel = "ここに移動",
}: UseEditingNewItemOptions) {
  const { categories } = useGrocery();
  const [editingNewCategory, setEditingNewCategory] = useState<string | null>(null);

  const handleAdd = useCallback(
    (category?: string) => {
      if (editingNewCategory !== null) return;
      setEditingNewCategory(category ?? "");
    },
    [editingNewCategory],
  );

  const handleEditComplete = useCallback(
    (name: string): AddError | null => {
      // Check if an item with the same name already exists in the current list
      const duplicate = currentItems?.find((item) => item.name.toLowerCase() === name.toLowerCase());
      if (duplicate) {
        // 別のタブにあって今のタブでは見えていないなら、どこにあるかを出して移せるようにする
        if (isInCurrentTab && !isInCurrentTab(duplicate) && describeTab && moveToCurrentTab) {
          return {
            message: `${describeTab(duplicate)}にあります`,
            action: {
              label: moveToCurrentTabLabel,
              run: () => {
                moveToCurrentTab(duplicate);
                setEditingNewCategory(null);
              },
            },
          };
        }
        const message = "既にリストに存在するアイテム";
        showToast?.(message, "mdi:alert-circle-outline");
        return { message };
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
      // カテゴリ未指定（その他／右下の＋）のときだけ、名前から自動設定する
      const category = editingNewCategory || guessCategory(name, categories);
      addItem(name, category, ...extraAddArgs);
      setEditingNewCategory(null);
      return null;
    },
    [
      addItem,
      editingNewCategory,
      extraAddArgs,
      currentItems,
      otherItems,
      moveFromOther,
      showToast,
      categories,
      isInCurrentTab,
      describeTab,
      moveToCurrentTab,
      moveToCurrentTabLabel,
    ],
  );

  const handleEditCancel = useCallback(() => {
    setEditingNewCategory(null);
  }, []);

  return { editingNewCategory, handleAdd, handleEditComplete, handleEditCancel };
}
