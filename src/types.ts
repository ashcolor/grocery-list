export interface NamedItem {
  name: string;
  emoji: string;
}

export interface GroceryItem {
  id: number;
  name: string;
  category: string;
  location?: string;
  storageLocation?: string;
  purchaseDates?: number[];
  outOfStockDates?: number[];
}
