import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T, migrate?: (raw: unknown) => T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    if (!stored) return initialValue;
    // 中身が壊れていても画面が真っ白にならないよう、読めなければ初期値にする
    try {
      const parsed = JSON.parse(stored);
      return migrate ? migrate(parsed) : (parsed as T);
    } catch {
      console.warn(`localStorage の "${key}" を読み込めなかったので初期値を使います`);
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
