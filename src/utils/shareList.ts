import type { GroceryItem } from "../types";

/** 共有URLのクエリ名 */
export const SHARE_QUERY_KEY = "list";

export type ListKind = "shopping" | "outOfStock";

export interface SharedList {
  kind: ListKind;
  items: { name: string; category: string }[];
}

/** 短くするため、URLには [名前, カテゴリ] の配列で載せる */
interface SharedListPayload {
  k: "s" | "o";
  i: [string, string][];
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(encoded: string): Uint8Array {
  const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  return Uint8Array.from(atob(`${normalized}${padding}`), (char) => char.charCodeAt(0));
}

/** リストを共有URLにする */
export function buildShareUrl(kind: ListKind, items: GroceryItem[]): string {
  const payload: SharedListPayload = {
    k: kind === "shopping" ? "s" : "o",
    i: items.map((item) => [item.name, item.category]),
  };
  const encoded = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const url = new URL(kind === "shopping" ? "/" : "/out-of-stock", window.location.origin);
  url.searchParams.set(SHARE_QUERY_KEY, encoded);
  return url.toString();
}

/** 共有URLのクエリからリストを読み取る。壊れていれば null */
export function parseSharedList(encoded: string): SharedList | null {
  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(encoded))) as SharedListPayload;
    if ((payload.k !== "s" && payload.k !== "o") || !Array.isArray(payload.i)) return null;
    const items = payload.i
      .filter((entry) => Array.isArray(entry) && typeof entry[0] === "string")
      .map(([name, category]) => ({ name, category: typeof category === "string" ? category : "" }));
    return { kind: payload.k === "s" ? "shopping" : "outOfStock", items };
  } catch {
    return null;
  }
}

/** 共有用のテキスト（カテゴリごとにまとめる） */
export function buildShareText(title: string, items: GroceryItem[], categoryOrder: string[]): string {
  const groups = new Map<string, string[]>();
  for (const name of [...categoryOrder, ""]) groups.set(name, []);
  for (const item of items) {
    const key = groups.has(item.category) ? item.category : "";
    groups.get(key)!.push(item.name);
  }
  const lines = [title];
  for (const [category, names] of groups) {
    if (names.length === 0) continue;
    lines.push("", `【${category || "その他"}】`, ...names.map((name) => `・${name}`));
  }
  return lines.join("\n");
}
