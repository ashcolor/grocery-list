import { useEffect, useRef } from "react";
import { useDroppable } from "@dnd-kit/core";

export function DroppableTab({
  id,
  isActive,
  onClick,
  children,
}: {
  id: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const ref = useRef<HTMLAnchorElement | null>(null);

  // スワイプなどで選択が変わったとき、タブが画面外なら見える位置までスクロールする
  useEffect(() => {
    if (isActive) ref.current?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [isActive]);

  return (
    <a
      ref={(el) => {
        ref.current = el;
        setNodeRef(el);
      }}
      role="tab"
      className={`tab whitespace-nowrap ${isActive ? "tab-active" : ""} ${isOver ? "bg-primary/20! border-primary!" : ""}`}
      onClick={onClick}
    >
      {children}
    </a>
  );
}
