import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T, migrate?: (raw: unknown) => T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    if (!stored) return initialValue;
    const parsed = JSON.parse(stored);
    return migrate ? migrate(parsed) : (parsed as T);
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
