import { UNSET_FILTER, UNSET_PLACE_LABEL } from "../constants";
import type { NamedItem } from "../types";

/**
 * アイテムの店・保管場所が、選択中のタブに表示される値か。
 * filter が null は「すべて」、UNSET_FILTER は「未設定」タブ
 */
export function matchesPlaceFilter(place: string | undefined, filter: string | null): boolean {
  if (filter === null) return true;
  if (filter === UNSET_FILTER) return !place;
  return place === filter;
}

/** 店・保管場所の表示名（「🛒 スーパー」）。未設定なら「未設定」 */
export function placeLabel(place: string | undefined, places: NamedItem[]): string {
  const found = places.find((p) => p.name === place);
  return found ? `${found.emoji} ${found.name}` : UNSET_PLACE_LABEL;
}
