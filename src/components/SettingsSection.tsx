import { useState } from "react";
import { Icon } from "@iconify/react";
import type { NamedItem } from "../types";
import { SortableNamedItem } from "./SortableNamedItem";
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
  title: string;
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
}

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
}: SettingsSectionProps) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmoji, setEditEmoji] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const startEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditName(items[idx].name);
    setEditEmoji(items[idx].emoji);
  };

  const saveEdit = (oldName: string) => {
    const name = editName.trim();
    const emoji = editEmoji.trim();
    if (!name || !emoji) return;
    onUpdate(oldName, { name, emoji });
    setEditingIdx(null);
  };

  const handleAdd = () => {
    const name = newName.trim();
    const emoji = newEmoji.trim();
    if (!name || !emoji) return;
    if (items.some((i) => i.name === name)) return;
    onAdd({ name, emoji });
    setNewName("");
    setNewEmoji("");
    setAdding(false);
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
      <h2 className="text-lg font-bold mt-6">{title}</h2>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-2">
            {items.map((item, idx) => (
              <SortableNamedItem
                key={item.name}
                item={item}
                sortableId={sortableId(idPrefix, item.name)}
                isEditing={editingIdx === idx}
                editName={editName}
                editEmoji={editEmoji}
                onEditName={setEditName}
                onEditEmoji={setEditEmoji}
                onStartEdit={() => startEdit(idx)}
                onSaveEdit={() => saveEdit(item.name)}
                onCancelEdit={() => setEditingIdx(null)}
                onRemove={() => onRemove(item.name)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {adding ? (
        <div className="bg-base-100 rounded-lg px-4 py-3 shadow-sm flex items-center gap-2">
          <input
            type="text"
            className="input input-sm w-16 text-center"
            value={newEmoji}
            onChange={(e) => setNewEmoji(e.target.value)}
            placeholder={emojiPlaceholder}
            autoFocus
          />
          <input
            type="text"
            className="input input-sm flex-1"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder={namePlaceholder}
          />
          <button className="btn btn-sm btn-primary" onClick={handleAdd}>
            <Icon icon="mdi:check" className="size-4" />
          </button>
          <button className="btn btn-sm btn-ghost" onClick={() => setAdding(false)}>
            <Icon icon="mdi:close" className="size-4" />
          </button>
        </div>
      ) : (
        <button className="btn btn-outline btn-sm self-start" onClick={() => setAdding(true)}>
          <Icon icon="mdi:plus" className="size-4" />
          {addLabel}
        </button>
      )}
    </>
  );
}
