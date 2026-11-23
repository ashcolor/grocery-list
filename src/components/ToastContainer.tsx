import { Icon } from "@iconify/react";
import type { Toast } from "../hooks/useToast";

/**
 * トーストの表示。フックの中でコンポーネントを定義すると再描画のたびに作り直されて
 * アニメーションやボタン操作が途切れるので、外に出している
 */
export function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
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
                      onDismiss(t.id);
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
}
