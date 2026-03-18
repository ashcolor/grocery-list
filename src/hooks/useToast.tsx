import { useState, useCallback, useRef } from "react";
import { Icon } from "@iconify/react";

interface Toast {
  id: number;
  message: string;
  icon: string;
  onUndo?: () => void;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message: string, icon: string, onUndo?: () => void) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, icon, onUndo }]);
    const timer = setTimeout(() => {
      timers.current.delete(id);
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
    timers.current.set(id, timer);
  }, []);

  const ToastContainer = () => {
    const count = toasts.length;
    if (count === 0) return null;

    return (
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center">
        <div className="grid [&>*]:col-start-1 [&>*]:row-start-1">
          {toasts.map((t, i) => {
            const isTop = i === count - 1;
            const depth = count - 1 - i;

            return (
              <div
                key={t.id}
                className="transition-all duration-200"
                style={{
                  transform: `translateY(${depth * 8}px) scale(${1 - depth * 0.05})`,
                  opacity: isTop ? 1 : 0.4,
                  zIndex: count - depth,
                  pointerEvents: isTop ? "auto" : "none",
                }}
              >
                <div className="alert shadow-lg flex items-center gap-2 whitespace-nowrap">
                  <Icon icon={t.icon} className="size-5" />
                  <span className="flex-1">{t.message}</span>
                  {t.onUndo && (
                    <button
                      className="btn btn-sm btn-ghost font-bold"
                      onClick={() => {
                        t.onUndo!();
                        dismiss(t.id);
                      }}
                    >
                      戻す
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return { show, ToastContainer };
}
