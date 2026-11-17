import { useRef } from "react";
import { Icon } from "@iconify/react";
import { resizeImageToDataUrl } from "../utils/resizeImage";
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
  /** 画像（会員カードなど）の設定を有効にする */
  withImage?: boolean;
  editImage?: string;
  onEditImage?: (v: string | undefined) => void;
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
  withImage,
  editImage,
  onEditImage,
}: SortableNamedItemProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      onEditImage?.(await resizeImageToDataUrl(file));
    } catch {
      window.alert("画像を読み込めませんでした");
    }
  };

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
        <div className="flex flex-col gap-2">
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
        {withImage && (
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            {editImage && (
              <img src={editImage} alt="" className="h-12 rounded bg-white object-contain" />
            )}
            <button type="button" className="btn btn-xs btn-outline" onClick={() => fileInputRef.current?.click()}>
              <Icon icon="mdi:image-plus" className="size-4" />
              {editImage ? "画像を変更" : "会員カードなどの画像を設定"}
            </button>
            {editImage && (
              <button type="button" className="btn btn-xs btn-ghost text-error" onClick={() => onEditImage?.(undefined)}>
                削除
              </button>
            )}
          </div>
        )}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-lg cursor-pointer" onClick={onStartEdit}>{item.emoji}</span>
          <span className="flex-1 cursor-pointer" onClick={onStartEdit}>{item.name}</span>
          {withImage && item.image && (
            <Icon icon="mdi:image-outline" className="size-4 text-base-content/40" />
          )}
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
