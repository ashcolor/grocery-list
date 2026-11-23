import { useState, useCallback, useRef } from "react";

export interface Toast {
  id: number;
  message: string;
  icon: string;
  onUndo?: () => void;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  // 同じミリ秒に複数出しても key が被らないよう連番にする
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message: string, icon: string, onUndo?: () => void) => {
    const id = ++nextId.current;
    setToasts((prev) => [...prev, { id, message, icon, onUndo }]);
    const timer = setTimeout(() => {
      timers.current.delete(id);
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
    timers.current.set(id, timer);
  }, []);

  return { toasts, show, dismiss };
}
