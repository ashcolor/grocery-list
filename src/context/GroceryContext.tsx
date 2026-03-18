import { createContext, useContext, useCallback, type ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useToast } from "../hooks/useToast";

export interface CategoryDef {
  name: string;
  emoji: string;
}

export interface LocationDef {
  name: string;
  emoji: string;
}

const DEFAULT_CATEGORIES: CategoryDef[] = [
  { name: "食品", emoji: "🍖" },
  { name: "飲み物", emoji: "🥤" },
  { name: "日用品", emoji: "🧻" },
  { name: "その他", emoji: "📦" },
];

export interface GroceryItem {
  id: number;
  name: string;
  category: string;
  location?: string;
  purchaseDates?: number[];
  outOfStockDates?: number[];
}

interface GroceryContextValue {
  categories: CategoryDef[];
  addCategory: (category: CategoryDef) => void;
  removeCategory: (name: string) => void;
  updateCategory: (oldName: string, updated: CategoryDef) => void;
  reorderCategories: (fromIdx: number, toIdx: number) => void;
  locations: LocationDef[];
  addLocation: (loc: LocationDef) => void;
  removeLocation: (name: string) => void;
  updateLocation: (oldName: string, updated: LocationDef) => void;
  reorderLocations: (fromIdx: number, toIdx: number) => void;
  updateItemLocation: (id: number, location: string | undefined) => void;
  shoppingItems: GroceryItem[];
  outOfStockItems: GroceryItem[];
  addShoppingItem: (name: string, category?: string, location?: string) => number;
  addOutOfStockItem: (name: string, category?: string, location?: string) => number;
  removeShoppingItem: (id: number) => void;
  removeOutOfStockItem: (id: number) => void;
  updateItemName: (id: number, name: string) => void;
  updateItemCategory: (id: number, category: string) => void;
  reorderShoppingItems: (fromId: number, toId: number) => void;
  reorderOutOfStockItems: (fromId: number, toId: number) => void;
  moveToOutOfStock: (id: number, options?: { silent?: boolean }) => void;
  moveToShopping: (id: number, options?: { silent?: boolean }) => void;
  showToast: (message: string, icon: string, onUndo?: () => void) => void;
}

const DEFAULT_ITEMS: GroceryItem[] = [
  { id: 1, name: "納豆", category: "食品" },
  { id: 2, name: "トイレットペーパー", category: "日用品" },
  { id: 3, name: "ティッシュ", category: "日用品" },
  { id: 4, name: "キムチ", category: "食品" },
  { id: 5, name: "豆乳", category: "飲み物" },
  { id: 6, name: "ヨーグルト", category: "食品" },
  { id: 7, name: "コーヒー", category: "飲み物" },
  { id: 8, name: "麦茶", category: "飲み物" },
];

const GroceryContext = createContext<GroceryContextValue | null>(null);

export function GroceryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useLocalStorage<CategoryDef[]>(
    "categories",
    DEFAULT_CATEGORIES,
  );
  const [shoppingItems, setShoppingItems] = useLocalStorage<GroceryItem[]>(
    "grocery-items",
    DEFAULT_ITEMS,
  );
  const [outOfStockItems, setOutOfStockItems] = useLocalStorage<GroceryItem[]>(
    "out-of-stock-items",
    [],
  );
  const [locations, setLocations] = useLocalStorage<LocationDef[]>(
    "locations",
    [],
    (raw) => {
      const arr = raw as any[];
      if (arr.length > 0 && typeof arr[0] === "string") {
        return arr.map((name: string) => ({ name, emoji: "📍" }));
      }
      return arr as LocationDef[];
    },
  );
  const { show, ToastContainer } = useToast();

  const addLocation = useCallback((loc: LocationDef) => {
    setLocations((prev) => prev.some((l) => l.name === loc.name) ? prev : [...prev, loc]);
  }, [setLocations]);

  const removeLocation = useCallback((name: string) => {
    setLocations((prev) => prev.filter((l) => l.name !== name));
    const clear = (item: GroceryItem) =>
      item.location === name ? { ...item, location: undefined } : item;
    setShoppingItems((prev) => prev.map(clear));
    setOutOfStockItems((prev) => prev.map(clear));
  }, [setLocations, setShoppingItems, setOutOfStockItems]);

  const updateLocation = useCallback((oldName: string, updated: LocationDef) => {
    setLocations((prev) => prev.map((l) => (l.name === oldName ? updated : l)));
    if (oldName !== updated.name) {
      const rename = (item: GroceryItem) =>
        item.location === oldName ? { ...item, location: updated.name } : item;
      setShoppingItems((prev) => prev.map(rename));
      setOutOfStockItems((prev) => prev.map(rename));
    }
  }, [setLocations, setShoppingItems, setOutOfStockItems]);

  const reorderLocations = useCallback((fromIdx: number, toIdx: number) => {
    setLocations((prev) => {
      const next = [...prev];
      const [item] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, item);
      return next;
    });
  }, [setLocations]);

  const updateItemLocation = useCallback((id: number, location: string | undefined) => {
    setShoppingItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, location } : item)),
    );
    setOutOfStockItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, location } : item)),
    );
  }, [setShoppingItems, setOutOfStockItems]);

  const addCategory = useCallback((category: CategoryDef) => {
    setCategories((prev) => [...prev, category]);
  }, [setCategories]);

  const removeCategory = useCallback((name: string) => {
    setCategories((prev) => prev.filter((c) => c.name !== name));
    const fallback = "";
    setShoppingItems((prev) =>
      prev.map((item) => (item.category === name ? { ...item, category: fallback } : item)),
    );
    setOutOfStockItems((prev) =>
      prev.map((item) => (item.category === name ? { ...item, category: fallback } : item)),
    );
  }, [setCategories, setShoppingItems, setOutOfStockItems]);

  const updateCategory = useCallback((oldName: string, updated: CategoryDef) => {
    setCategories((prev) =>
      prev.map((c) => (c.name === oldName ? updated : c)),
    );
    if (oldName !== updated.name) {
      setShoppingItems((prev) =>
        prev.map((item) => (item.category === oldName ? { ...item, category: updated.name } : item)),
      );
      setOutOfStockItems((prev) =>
        prev.map((item) => (item.category === oldName ? { ...item, category: updated.name } : item)),
      );
    }
  }, [setCategories, setShoppingItems, setOutOfStockItems]);

  const reorderCategories = useCallback((fromIdx: number, toIdx: number) => {
    setCategories((prev) => {
      const next = [...prev];
      const [item] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, item);
      return next;
    });
  }, [setCategories]);

  const addShoppingItem = useCallback((name: string, category = "", location?: string) => {
    const id = Date.now();
    setShoppingItems((prev) => [...prev, { id, name, category, location }]);
    return id;
  }, [setShoppingItems]);

  const addOutOfStockItem = useCallback((name: string, category = "", location?: string) => {
    const id = Date.now();
    setOutOfStockItems((prev) => [...prev, { id, name, category, location }]);
    return id;
  }, [setOutOfStockItems]);

  const removeShoppingItem = useCallback((id: number) => {
    setShoppingItems((prev) => prev.filter((item) => item.id !== id));
  }, [setShoppingItems]);

  const removeOutOfStockItem = useCallback((id: number) => {
    setOutOfStockItems((prev) => prev.filter((item) => item.id !== id));
  }, [setOutOfStockItems]);

  const updateItemName = useCallback((id: number, name: string) => {
    setShoppingItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name } : item)),
    );
    setOutOfStockItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name } : item)),
    );
  }, [setShoppingItems, setOutOfStockItems]);

  const updateItemCategory = useCallback((id: number, category: string) => {
    setShoppingItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, category } : item)),
    );
    setOutOfStockItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, category } : item)),
    );
  }, [setShoppingItems, setOutOfStockItems]);

  const reorderShoppingItems = useCallback((fromId: number, toId: number) => {
    setShoppingItems((prev) => {
      const next = [...prev];
      const fromIdx = next.findIndex((i) => i.id === fromId);
      const toIdx = next.findIndex((i) => i.id === toId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const [item] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, item);
      return next;
    });
  }, [setShoppingItems]);

  const reorderOutOfStockItems = useCallback((fromId: number, toId: number) => {
    setOutOfStockItems((prev) => {
      const next = [...prev];
      const fromIdx = next.findIndex((i) => i.id === fromId);
      const toIdx = next.findIndex((i) => i.id === toId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const [item] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, item);
      return next;
    });
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

  return (
    <GroceryContext value={{
      categories,
      addCategory,
      removeCategory,
      updateCategory,
      reorderCategories,
      locations,
      addLocation,
      removeLocation,
      updateLocation,
      reorderLocations,
      updateItemLocation,
      shoppingItems,
      outOfStockItems,
      addShoppingItem,
      addOutOfStockItem,
      removeShoppingItem,
      removeOutOfStockItem,
      updateItemName,
      updateItemCategory,
      reorderShoppingItems,
      reorderOutOfStockItems,
      moveToOutOfStock,
      moveToShopping,
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
