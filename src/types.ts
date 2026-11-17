export interface NamedItem {
  name: string;
  emoji: string;
  /** 店の会員カードのバーコードなど（data URL）。店でのみ使用 */
  image?: string;
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
