import { createContext, useContext, useCallback, type ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useToast } from "../hooks/useToast";

export const CATEGORIES = [
  "食品",
  "飲み物",
  "日用品",
  "その他",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface GroceryItem {
  id: number;
  name: string;
  category: Category;
}

interface GroceryContextValue {
  shoppingItems: GroceryItem[];
  outOfStockItems: GroceryItem[];
  addShoppingItem: (name: string) => void;
  addOutOfStockItem: (name: string) => void;
  removeShoppingItem: (id: number) => void;
  removeOutOfStockItem: (id: number) => void;
  updateItemCategory: (id: number, category: Category) => void;
  moveToOutOfStock: (id: number) => void;
  moveToShopping: (id: number) => void;
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
  const [shoppingItems, setShoppingItems] = useLocalStorage<GroceryItem[]>(
    "grocery-items",
    DEFAULT_ITEMS,
  );
  const [outOfStockItems, setOutOfStockItems] = useLocalStorage<GroceryItem[]>(
    "out-of-stock-items",
    [],
  );
  const { show, ToastContainer } = useToast();

  const addShoppingItem = useCallback((name: string) => {
    setShoppingItems((prev) => [...prev, { id: Date.now(), name, category: "その他" }]);
  }, [setShoppingItems]);

  const addOutOfStockItem = useCallback((name: string) => {
    setOutOfStockItems((prev) => [...prev, { id: Date.now(), name, category: "その他" }]);
  }, [setOutOfStockItems]);

  const removeShoppingItem = useCallback((id: number) => {
    setShoppingItems((prev) => prev.filter((item) => item.id !== id));
  }, [setShoppingItems]);

  const removeOutOfStockItem = useCallback((id: number) => {
    setOutOfStockItems((prev) => prev.filter((item) => item.id !== id));
  }, [setOutOfStockItems]);

  const updateItemCategory = useCallback((id: number, category: Category) => {
    setShoppingItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, category } : item)),
    );
    setOutOfStockItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, category } : item)),
    );
  }, [setShoppingItems, setOutOfStockItems]);

  const moveToOutOfStock = useCallback((id: number) => {
    const item = shoppingItems.find((i) => i.id === id);
    if (!item) return;
    setShoppingItems((prev) => prev.filter((i) => i.id !== id));
    const newId = Date.now();
    setOutOfStockItems((prev) => [...prev, { ...item, id: newId }]);
    show("買った！", "mdi:cart-check", () => {
      setOutOfStockItems((prev) => prev.filter((i) => i.id !== newId));
      setShoppingItems((prev) => [...prev, item]);
    });
  }, [shoppingItems, setShoppingItems, setOutOfStockItems, show]);

  const moveToShopping = useCallback((id: number) => {
    const item = outOfStockItems.find((i) => i.id === id);
    if (!item) return;
    setOutOfStockItems((prev) => prev.filter((i) => i.id !== id));
    const newId = Date.now();
    setShoppingItems((prev) => [...prev, { ...item, id: newId }]);
    show("今度買う！", "mdi:cart-plus", () => {
      setShoppingItems((prev) => prev.filter((i) => i.id !== newId));
      setOutOfStockItems((prev) => [...prev, item]);
    });
  }, [outOfStockItems, setOutOfStockItems, setShoppingItems, show]);

  return (
    <GroceryContext value={{
      shoppingItems,
      outOfStockItems,
      addShoppingItem,
      addOutOfStockItem,
      removeShoppingItem,
      removeOutOfStockItem,
      updateItemCategory,
      moveToOutOfStock,
      moveToShopping,
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
