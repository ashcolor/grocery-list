import { Icon } from "@iconify/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { NamedItem } from "../types";

interface SortableNamedItemProps {
  item: NamedItem;
  sortableId: string;
  /** タップで編集モーダルを開く */
  onClick: () => void;
  /** 画像（会員カードなど）を設定済みならアイコンを出す */
  withImage?: boolean;
}

export function SortableNamedItem({ item, sortableId, onClick, withImage }: SortableNamedItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortableId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`bg-base-100 rounded-box border border-base-300 ${isDragging ? "opacity-50 z-10" : ""}`}
    >
      <div className="flex items-center gap-3 pr-4">
        <button
          type="button"
          className="flex flex-1 items-center gap-3 py-3 pl-4 text-left cursor-pointer min-w-0"
          onClick={onClick}
        >
          <span className="text-lg">{item.emoji}</span>
          <span className="flex-1 truncate">{item.name}</span>
          {withImage && item.image && (
            <Icon icon="mdi:image-outline" className="size-4 text-base-content/40" />
          )}
        </button>
        <span ref={setActivatorNodeRef} {...listeners} className="touch-none cursor-grab">
          <Icon icon="mdi:drag-horizontal-variant" className="size-5 text-base-content/30 shrink-0" />
        </span>
      </div>
    </li>
  );
}
