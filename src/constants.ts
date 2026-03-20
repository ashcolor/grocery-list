import type { NamedItem, GroceryItem } from "./types";

export const UNSET_FILTER = "__unset__";

export const DEFAULT_CATEGORIES: NamedItem[] = [
  { name: "肉・魚", emoji: "🥩" },
  { name: "野菜・果物", emoji: "🥬" },
  { name: "その他の食品", emoji: "🍚" },
  { name: "飲み物", emoji: "🥤" },
  { name: "日用品", emoji: "🧻" },
];

export const DEFAULT_LOCATIONS: NamedItem[] = [
  { name: "スーパー", emoji: "🛒" },
  { name: "ホームセンター", emoji: "🏠" },
];

export const DEFAULT_STORAGE_LOCATIONS: NamedItem[] = [
  { name: "冷蔵庫", emoji: "🧊" },
  { name: "台所", emoji: "🍳" },
  { name: "洗面所", emoji: "🪥" },
];

export const DEFAULT_ITEMS: GroceryItem[] = [
  { id: 1, name: "牛肉", category: "肉・魚", location: "スーパー", storageLocation: "冷蔵庫" },
  { id: 2, name: "豚肉", category: "肉・魚", location: "スーパー", storageLocation: "冷蔵庫" },
  { id: 3, name: "鶏肉", category: "肉・魚", location: "スーパー", storageLocation: "冷蔵庫" },
  { id: 4, name: "ひき肉", category: "肉・魚", location: "スーパー", storageLocation: "冷蔵庫" },
  { id: 5, name: "刺し身", category: "肉・魚", location: "スーパー", storageLocation: "冷蔵庫" },
  { id: 6, name: "ネギ", category: "野菜・果物", location: "スーパー", storageLocation: "冷蔵庫" },
  { id: 7, name: "白菜", category: "野菜・果物", location: "スーパー", storageLocation: "冷蔵庫" },
  { id: 8, name: "もやし", category: "野菜・果物", location: "スーパー", storageLocation: "冷蔵庫" },
  { id: 9, name: "キャベツ", category: "野菜・果物", location: "スーパー", storageLocation: "冷蔵庫" },
  { id: 10, name: "レタス", category: "野菜・果物", location: "スーパー", storageLocation: "冷蔵庫" },
  { id: 11, name: "トマト", category: "野菜・果物", location: "スーパー", storageLocation: "冷蔵庫" },
  { id: 12, name: "きゅうり", category: "野菜・果物", location: "スーパー", storageLocation: "冷蔵庫" },
  { id: 13, name: "玉ねぎ", category: "野菜・果物", location: "スーパー", storageLocation: "台所" },
  { id: 14, name: "にんじん", category: "野菜・果物", location: "スーパー", storageLocation: "冷蔵庫" },
  { id: 15, name: "パスタ", category: "その他の食品", location: "スーパー", storageLocation: "台所" },
  { id: 16, name: "ラーメン", category: "その他の食品", location: "スーパー", storageLocation: "台所" },
  { id: 17, name: "豆腐", category: "その他の食品", location: "スーパー", storageLocation: "冷蔵庫" },
  { id: 18, name: "トイレットペーパー", category: "日用品", location: "ホームセンター", storageLocation: "洗面所" },
  { id: 19, name: "ティッシュ", category: "日用品", location: "ホームセンター", storageLocation: "台所" },
  { id: 20, name: "ゴミ袋", category: "日用品", location: "ホームセンター", storageLocation: "台所" },
];
