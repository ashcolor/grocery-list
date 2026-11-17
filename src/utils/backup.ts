/** バックアップ対象の localStorage キー（テーマなど端末ごとの設定は含めない） */
const BACKUP_KEYS = [
  "grocery-items",
  "out-of-stock-items",
  "categories",
  "locations",
  "storage-locations",
  "memo",
  "memo-images",
] as const;

const APP_ID = "grocery-list";
const VERSION = 1;

interface BackupFile {
  app: typeof APP_ID;
  version: number;
  exportedAt: string;
  data: Record<string, unknown>;
}

/** 全データを JSON ファイルとしてダウンロードする */
export function exportBackup() {
  const data: Record<string, unknown> = {};
  for (const key of BACKUP_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw !== null) data[key] = JSON.parse(raw);
  }
  const backup: BackupFile = { app: APP_ID, version: VERSION, exportedAt: new Date().toISOString(), data };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const a = document.createElement("a");
  a.href = url;
  a.download = `grocery-list-${ymd}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * バックアップファイルを読み込んで localStorage を上書きする。
 * 画面の状態は各フックが保持しているため、呼び出し側でリロードすること。
 */
export async function importBackup(file: File): Promise<void> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new Error("JSONファイルとして読み込めませんでした");
  }
  const backup = parsed as Partial<BackupFile>;
  if (backup?.app !== APP_ID || typeof backup.data !== "object" || backup.data === null) {
    throw new Error("このアプリのバックアップファイルではありません");
  }
  for (const key of BACKUP_KEYS) {
    if (key in backup.data) {
      localStorage.setItem(key, JSON.stringify(backup.data[key]));
    } else {
      localStorage.removeItem(key);
    }
  }
}
