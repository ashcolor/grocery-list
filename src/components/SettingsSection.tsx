import { useState } from "react";
import { Icon } from "@iconify/react";
import type { NamedItem } from "../types";
import { SortableNamedItem } from "./SortableNamedItem";
import { NamedItemModal } from "./NamedItemModal";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

interface SettingsSectionProps {
  /** 省略時は見出しを出さない（ページ側で見出しを出す場合） */
  title?: string;
  items: NamedItem[];
  /** Prefix for sortable IDs (to avoid collisions between sections) */
  idPrefix?: string;
  addLabel: string;
  emojiPlaceholder?: string;
  namePlaceholder: string;
  onAdd: (item: NamedItem) => void;
  onRemove: (name: string) => void;
  onUpdate: (oldName: string, updated: NamedItem) => void;
  onReorder: (fromIdx: number, toIdx: number) => void;
  /** 各項目に画像（会員カードなど）を設定できるようにする */
  withImage?: boolean;
}

/** モーダルを新規追加で開いていることを表す値（項目名と衝突しない） */
const ADDING = "\u0000adding";

function sortableId(prefix: string | undefined, name: string) {
  return prefix ? `${prefix}-${name}` : name;
}

export function SettingsSection({
  title,
  items,
  idPrefix,
  addLabel,
  emojiPlaceholder = "😀",
  namePlaceholder,
  onAdd,
  onRemove,
  onUpdate,
  onReorder,
  withImage,
}: SettingsSectionProps) {
  /** 編集中の項目名。新規追加中は ADDING、閉じているときは null */
  const [modalTarget, setModalTarget] = useState<string | null>(null);
  const editingItem = items.find((i) => i.name === modalTarget);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleSave = (item: NamedItem): string | null => {
    const isDuplicate = items.some((i) => i.name === item.name && i.name !== editingItem?.name);
    if (isDuplicate) return "同じ名前がすでにあります";
    if (editingItem) {
      onUpdate(editingItem.name, item);
      // 名前を変えても同じ項目を編集し続けられるよう、追従させる
      setModalTarget(item.name);
    } else {
      onAdd(item);
    }
    return null;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const prefix = idPrefix ? `${idPrefix}-` : "";
    const fromIdx = items.findIndex((i) => `${prefix}${i.name}` === active.id);
    const toIdx = items.findIndex((i) => `${prefix}${i.name}` === over.id);
    if (fromIdx !== -1 && toIdx !== -1) onReorder(fromIdx, toIdx);
  };

  const sortableIds = items.map((i) => sortableId(idPrefix, i.name));

  return (
    <>
      {title && <h2 className="text-lg font-bold mt-6">{title}</h2>}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <SortableNamedItem
                key={item.name}
                item={item}
                sortableId={sortableId(idPrefix, item.name)}
                onClick={() => setModalTarget(item.name)}
                withImage={withImage}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <button className="btn btn-primary btn-sm w-full" onClick={() => setModalTarget(ADDING)}>
        <Icon icon="mdi:plus" className="size-4" />
        {addLabel}
      </button>

      {modalTarget !== null && (
        <NamedItemModal
          title={editingItem ? `${editingItem.name}を編集` : addLabel}
          initial={editingItem}
          emojiPlaceholder={emojiPlaceholder}
          namePlaceholder={namePlaceholder}
          withImage={withImage}
          onSave={handleSave}
          onDelete={editingItem ? () => onRemove(editingItem.name) : undefined}
          onClose={() => setModalTarget(null)}
        />
      )}
    </>
  );
}
