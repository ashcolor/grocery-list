import { createContext, useContext, useCallback, useMemo, type ReactNode } from "react";
import type { NamedItem, GroceryItem } from "../types";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_LOCATIONS,
  DEFAULT_STORAGE_LOCATIONS,
  DEFAULT_ITEMS,
} from "../constants";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useNamedItemList } from "../hooks/useNamedItemList";
import { useToast } from "../hooks/useToast";

interface GroceryContextValue {
  categories: NamedItem[];
  addCategory: (item: NamedItem) => void;
  removeCategory: (name: string) => void;
  updateCategory: (oldName: string, updated: NamedItem) => void;
  reorderCategories: (fromIdx: number, toIdx: number) => void;

  locations: NamedItem[];
  addLocation: (item: NamedItem) => void;
  removeLocation: (name: string) => void;
  updateLocation: (oldName: string, updated: NamedItem) => void;
  reorderLocations: (fromIdx: number, toIdx: number) => void;

  storageLocations: NamedItem[];
  addStorageLocation: (item: NamedItem) => void;
  removeStorageLocation: (name: string) => void;
  updateStorageLocation: (oldName: string, updated: NamedItem) => void;
  reorderStorageLocations: (fromIdx: number, toIdx: number) => void;

  shoppingItems: GroceryItem[];
  outOfStockItems: GroceryItem[];

  addShoppingItem: (name: string, category?: string, location?: string, storageLocation?: string) => number;
  addOutOfStockItem: (name: string, category?: string, location?: string, storageLocation?: string) => number;
  removeShoppingItem: (id: number) => void;
  removeOutOfStockItem: (id: number) => void;

  updateItemName: (id: number, name: string) => void;
  updateItemCategory: (id: number, category: string) => void;
  updateItemLocation: (id: number, location: string | undefined) => void;
  updateItemStorageLocation: (id: number, storageLocation: string | undefined) => void;

  reorderShoppingItems: (fromId: number, toId: number) => void;
  reorderOutOfStockItems: (fromId: number, toId: number) => void;
  moveToOutOfStock: (id: number, options?: { silent?: boolean }) => void;
  moveToShopping: (id: number, options?: { silent?: boolean }) => void;

  resetToDefaults: () => void;
  clearAll: () => void;
  showToast: (message: string, icon: string, onUndo?: () => void) => void;
}

const GroceryContext = createContext<GroceryContextValue | null>(null);

function reorderById(prev: GroceryItem[], fromId: number, toId: number): GroceryItem[] {
  const next = [...prev];
  const fromIdx = next.findIndex((i) => i.id === fromId);
  const toIdx = next.findIndex((i) => i.id === toId);
  if (fromIdx === -1 || toIdx === -1) return prev;
  const [item] = next.splice(fromIdx, 1);
  next.splice(toIdx, 0, item);
  return next;
}

export function GroceryProvider({ children }: { children: ReactNode }) {
  const [shoppingItems, setShoppingItems] = useLocalStorage<GroceryItem[]>(
    "grocery-items",
    DEFAULT_ITEMS,
  );
  const [outOfStockItems, setOutOfStockItems] = useLocalStorage<GroceryItem[]>(
    "out-of-stock-items",
    [],
  );
  const { show, ToastContainer } = useToast();

  const itemSetters = useMemo(
    () => [setShoppingItems, setOutOfStockItems],
    [setShoppingItems, setOutOfStockItems],
  );

  const categoryList = useNamedItemList({
    storageKey: "categories",
    defaultValue: DEFAULT_CATEGORIES,
    itemField: "category",
    itemSetters,
  });

  const locationList = useNamedItemList({
    storageKey: "locations",
    defaultValue: DEFAULT_LOCATIONS,
    itemField: "location",
    itemSetters,
    migrate: (raw) => {
      const arr = raw as any[];
      if (arr.length > 0 && typeof arr[0] === "string") {
        return arr.map((name: string) => ({ name, emoji: "📍" }));
      }
      return arr as NamedItem[];
    },
  });

  const storageLocationList = useNamedItemList({
    storageKey: "storage-locations",
    defaultValue: DEFAULT_STORAGE_LOCATIONS,
    itemField: "storageLocation",
    itemSetters,
  });

  const setCategories = categoryList.setItems;
  const setLocations = locationList.setItems;
  const setStorageLocations = storageLocationList.setItems;

  const updateItemField = useCallback(
    <K extends keyof GroceryItem>(field: K, id: number, value: GroceryItem[K]) => {
      const updater = (prev: GroceryItem[]) =>
        prev.map((item) => (item.id === id ? { ...item, [field]: value } : item));
      setShoppingItems(updater);
      setOutOfStockItems(updater);
    },
    [setShoppingItems, setOutOfStockItems],
  );

  const updateItemName = useCallback(
    (id: number, name: string) => updateItemField("name", id, name),
    [updateItemField],
  );
  const updateItemCategory = useCallback(
    (id: number, category: string) => updateItemField("category", id, category),
    [updateItemField],
  );
  const updateItemLocation = useCallback(
    (id: number, location: string | undefined) => updateItemField("location", id, location),
    [updateItemField],
  );
  const updateItemStorageLocation = useCallback(
    (id: number, storageLocation: string | undefined) => updateItemField("storageLocation", id, storageLocation),
    [updateItemField],
  );

  const addShoppingItem = useCallback((name: string, category = "", location?: string, storageLocation?: string) => {
    const id = Date.now();
    setShoppingItems((prev) => [...prev, { id, name, category, location, storageLocation }]);
    return id;
  }, [setShoppingItems]);

  const addOutOfStockItem = useCallback((name: string, category = "", location?: string, storageLocation?: string) => {
    const id = Date.now();
    setOutOfStockItems((prev) => [...prev, { id, name, category, location, storageLocation }]);
    return id;
  }, [setOutOfStockItems]);

  const removeShoppingItem = useCallback((id: number) => {
    setShoppingItems((prev) => prev.filter((item) => item.id !== id));
  }, [setShoppingItems]);

  const removeOutOfStockItem = useCallback((id: number) => {
    setOutOfStockItems((prev) => prev.filter((item) => item.id !== id));
  }, [setOutOfStockItems]);

  const reorderShoppingItems = useCallback((fromId: number, toId: number) => {
    setShoppingItems((prev) => reorderById(prev, fromId, toId));
  }, [setShoppingItems]);

  const reorderOutOfStockItems = useCallback((fromId: number, toId: number) => {
    setOutOfStockItems((prev) => reorderById(prev, fromId, toId));
  }, [setOutOfStockItems]);

  const moveToOutOfStock = useCallback((id: number, options?: { silent?: boolean }) => {
    const item = shoppingItems.find((i) => i.id === id);
    if (!item) return;
    setShoppingItems((prev) => prev.filter((i) => i.id !== id));
    const newId = Date.now();
    const purchaseDates = [...(item.purchaseDates ?? []), newId].slice(-10);
    const movedItem = { ...item, id: newId, purchaseDates };
    setOutOfStockItems((prev) => [...prev, movedItem]);
    if (!options?.silent) {
      show(`${item.name} を購入済みに`, "mdi:cart-check", () => {
        setOutOfStockItems((prev) => prev.filter((i) => i.id !== newId));
        setShoppingItems((prev) => [...prev, item]);
      });
    }
  }, [shoppingItems, setShoppingItems, setOutOfStockItems, show]);

  const moveToShopping = useCallback((id: number, options?: { silent?: boolean }) => {
    const item = outOfStockItems.find((i) => i.id === id);
    if (!item) return;
    setOutOfStockItems((prev) => prev.filter((i) => i.id !== id));
    const newId = Date.now();
    const outOfStockDates = [...(item.outOfStockDates ?? []), newId].slice(-10);
    const movedItem = { ...item, id: newId, outOfStockDates };
    setShoppingItems((prev) => [...prev, movedItem]);
    if (!options?.silent) {
      show(`${item.name} をお買い物リストに追加`, "mdi:cart-plus", () => {
        setShoppingItems((prev) => prev.filter((i) => i.id !== newId));
        setOutOfStockItems((prev) => [...prev, item]);
      });
    }
  }, [outOfStockItems, setOutOfStockItems, setShoppingItems, show]);

  const resetToDefaults = useCallback(() => {
    setCategories(DEFAULT_CATEGORIES);
    setLocations(DEFAULT_LOCATIONS);
    setStorageLocations(DEFAULT_STORAGE_LOCATIONS);
    setShoppingItems([]);
    setOutOfStockItems(DEFAULT_ITEMS);
  }, [setCategories, setLocations, setStorageLocations, setShoppingItems, setOutOfStockItems]);

  const clearAll = useCallback(() => {
    setCategories([]);
    setLocations([]);
    setStorageLocations([]);
    setShoppingItems([]);
    setOutOfStockItems([]);
  }, [setCategories, setLocations, setStorageLocations, setShoppingItems, setOutOfStockItems]);

  return (
    <GroceryContext value={{
      categories: categoryList.items,
      addCategory: categoryList.add,
      removeCategory: categoryList.remove,
      updateCategory: categoryList.update,
      reorderCategories: categoryList.reorder,

      locations: locationList.items,
      addLocation: locationList.add,
      removeLocation: locationList.remove,
      updateLocation: locationList.update,
      reorderLocations: locationList.reorder,

      storageLocations: storageLocationList.items,
      addStorageLocation: storageLocationList.add,
      removeStorageLocation: storageLocationList.remove,
      updateStorageLocation: storageLocationList.update,
      reorderStorageLocations: storageLocationList.reorder,

      shoppingItems,
      outOfStockItems,
      addShoppingItem,
      addOutOfStockItem,
      removeShoppingItem,
      removeOutOfStockItem,
      updateItemName,
      updateItemCategory,
      updateItemLocation,
      updateItemStorageLocation,
      reorderShoppingItems,
      reorderOutOfStockItems,
      moveToOutOfStock,
      moveToShopping,
      resetToDefaults,
      clearAll,
      showToast: show,
    }}>
      {children}
      <ToastContainer />
    </GroceryContext>
  );
}

export function useGrocery() {
  const ctx = useContext(GroceryContext);
  if (!ctx) throw new Error("useGrocery must be used within GroceryProvider");
  return ctx;
}
