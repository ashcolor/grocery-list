import { Icon } from "@iconify/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { NamedItem } from "../types";

interface SortableNamedItemProps {
  item: NamedItem;
  sortableId: string;
  isEditing: boolean;
  editName: string;
  editEmoji: string;
  onEditName: (v: string) => void;
  onEditEmoji: (v: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onRemove: () => void;
}

export function SortableNamedItem({
  item,
  sortableId,
  isEditing,
  editName,
  editEmoji,
  onEditName,
  onEditEmoji,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onRemove,
}: SortableNamedItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortableId, disabled: isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`bg-base-100 rounded-lg px-4 py-3 shadow-sm ${isDragging ? "opacity-50 z-10" : ""}`}
    >
      {isEditing ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="input input-sm w-16 text-center"
            value={editEmoji}
            onChange={(e) => onEditEmoji(e.target.value)}
            placeholder="😀"
          />
          <input
            type="text"
            className="input input-sm flex-1"
            value={editName}
            onChange={(e) => onEditName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSaveEdit()}
          />
          <button className="btn btn-sm btn-primary" onClick={onSaveEdit}>
            <Icon icon="mdi:check" className="size-4" />
          </button>
          <button className="btn btn-sm btn-ghost" onClick={onCancelEdit}>
            <Icon icon="mdi:close" className="size-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-lg cursor-pointer" onClick={onStartEdit}>{item.emoji}</span>
          <span className="flex-1 cursor-pointer" onClick={onStartEdit}>{item.name}</span>
          <button className="btn btn-sm btn-ghost text-error" onClick={onRemove}>
            <Icon icon="mdi:delete" className="size-4" />
          </button>
          <span ref={setActivatorNodeRef} {...listeners} className="touch-none cursor-grab">
            <Icon icon="fa6-solid:grip-lines" className="size-5 text-base-content/30 shrink-0" />
          </span>
        </div>
      )}
    </li>
  );
}
