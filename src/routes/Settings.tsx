import { useState } from "react";
import { Icon } from "@iconify/react";
import { useGrocery } from "../context/GroceryContext";
import type { CategoryDef, LocationDef } from "../context/GroceryContext";
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
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableCategoryItem({
  cat,
  idx,
  isEditing,
  editName,
  editEmoji,
  onEditName,
  onEditEmoji,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onRemove,
}: {
  cat: CategoryDef;
  idx: number;
  isEditing: boolean;
  editName: string;
  editEmoji: string;
  onEditName: (v: string) => void;
  onEditEmoji: (v: string) => void;
  onStartEdit: (idx: number) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onRemove: (name: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cat.name, disabled: isEditing });

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
            className="input input-bordered input-sm w-16 text-center"
            value={editEmoji}
            onChange={(e) => onEditEmoji(e.target.value)}
            placeholder="😀"
          />
          <input
            type="text"
            className="input input-bordered input-sm flex-1"
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
          <span className="text-lg cursor-pointer" onClick={() => onStartEdit(idx)}>{cat.emoji}</span>
          <span className="flex-1 cursor-pointer" onClick={() => onStartEdit(idx)}>{cat.name}</span>
          <button
            className="btn btn-sm btn-ghost text-error"
            onClick={() => onRemove(cat.name)}
          >
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

function SortableLocationItem({
  loc,
  idx,
  isEditing,
  editLocName,
  editLocEmoji,
  onEditLocName,
  onEditLocEmoji,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onRemove,
}: {
  loc: LocationDef;
  idx: number;
  isEditing: boolean;
  editLocName: string;
  editLocEmoji: string;
  onEditLocName: (v: string) => void;
  onEditLocEmoji: (v: string) => void;
  onStartEdit: (idx: number) => void;
  onSaveEdit: (oldName: string) => void;
  onCancelEdit: () => void;
  onRemove: (name: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: loc.name, disabled: isEditing });

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
            className="input input-bordered input-sm w-16 text-center"
            value={editLocEmoji}
            onChange={(e) => onEditLocEmoji(e.target.value)}
            placeholder="📍"
          />
          <input
            type="text"
            className="input input-bordered input-sm flex-1"
            value={editLocName}
            onChange={(e) => onEditLocName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSaveEdit(loc.name);
            }}
          />
          <button className="btn btn-sm btn-primary" onClick={() => onSaveEdit(loc.name)}>
            <Icon icon="mdi:check" className="size-4" />
          </button>
          <button className="btn btn-sm btn-ghost" onClick={onCancelEdit}>
            <Icon icon="mdi:close" className="size-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-lg cursor-pointer" onClick={() => onStartEdit(idx)}>{loc.emoji}</span>
          <span className="flex-1 cursor-pointer" onClick={() => onStartEdit(idx)}>{loc.name}</span>
          <button className="btn btn-sm btn-ghost text-error" onClick={() => onRemove(loc.name)}>
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

export default function Settings() {
  const { categories, addCategory, removeCategory, updateCategory, reorderCategories, locations, addLocation, removeLocation, updateLocation, reorderLocations, resetToDefaults, clearAll } = useGrocery();
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmoji, setEditEmoji] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("");

  const [editingLocIdx, setEditingLocIdx] = useState<number | null>(null);
  const [editLocName, setEditLocName] = useState("");
  const [editLocEmoji, setEditLocEmoji] = useState("");
  const [addingLoc, setAddingLoc] = useState(false);
  const [newLocName, setNewLocName] = useState("");
  const [newLocEmoji, setNewLocEmoji] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const startEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditName(categories[idx].name);
    setEditEmoji(categories[idx].emoji);
  };

  const saveEdit = () => {
    if (editingIdx === null) return;
    const name = editName.trim();
    const emoji = editEmoji.trim();
    if (!name || !emoji) return;
    const old = categories[editingIdx];
    updateCategory(old.name, { name, emoji });
    setEditingIdx(null);
  };

  const handleAdd = () => {
    const name = newName.trim();
    const emoji = newEmoji.trim();
    if (!name || !emoji) return;
    if (categories.some((c) => c.name === name)) return;
    addCategory({ name, emoji });
    setNewName("");
    setNewEmoji("");
    setAdding(false);
  };

  const handleCatDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIdx = categories.findIndex(c => c.name === active.id);
    const toIdx = categories.findIndex(c => c.name === over.id);
    if (fromIdx !== -1 && toIdx !== -1) reorderCategories(fromIdx, toIdx);
  };

  const handleLocDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIdx = locations.findIndex((l) => l.name === active.id);
    const toIdx = locations.findIndex((l) => l.name === over.id);
    if (fromIdx !== -1 && toIdx !== -1) reorderLocations(fromIdx, toIdx);
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold">カテゴリ</h2>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCatDragEnd}>
        <SortableContext items={categories.map(c => c.name)} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-2">
            {categories.map((cat, idx) => (
              <SortableCategoryItem
                key={cat.name}
                cat={cat}
                idx={idx}
                isEditing={editingIdx === idx}
                editName={editName}
                editEmoji={editEmoji}
                onEditName={setEditName}
                onEditEmoji={setEditEmoji}
                onStartEdit={startEdit}
                onSaveEdit={saveEdit}
                onCancelEdit={() => setEditingIdx(null)}
                onRemove={removeCategory}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {adding ? (
        <div className="bg-base-100 rounded-lg px-4 py-3 shadow-sm flex items-center gap-2">
          <input
            type="text"
            className="input input-bordered input-sm w-16 text-center"
            value={newEmoji}
            onChange={(e) => setNewEmoji(e.target.value)}
            placeholder="😀"
            autoFocus
          />
          <input
            type="text"
            className="input input-bordered input-sm flex-1"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="カテゴリ名"
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
          カテゴリを追加
        </button>
      )}

      <h2 className="text-lg font-bold mt-6">場所</h2>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleLocDragEnd}>
        <SortableContext items={locations.map((l) => l.name)} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-2">
            {locations.map((loc, idx) => (
              <SortableLocationItem
                key={loc.name}
                loc={loc}
                idx={idx}
                isEditing={editingLocIdx === idx}
                editLocName={editLocName}
                editLocEmoji={editLocEmoji}
                onEditLocName={setEditLocName}
                onEditLocEmoji={setEditLocEmoji}
                onStartEdit={(i) => { setEditingLocIdx(i); setEditLocName(locations[i].name); setEditLocEmoji(locations[i].emoji); }}
                onSaveEdit={(oldName) => {
                  const name = editLocName.trim();
                  const emoji = editLocEmoji.trim();
                  if (name && emoji) { updateLocation(oldName, { name, emoji }); setEditingLocIdx(null); }
                }}
                onCancelEdit={() => setEditingLocIdx(null)}
                onRemove={removeLocation}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {addingLoc ? (
        <div className="bg-base-100 rounded-lg px-4 py-3 shadow-sm flex items-center gap-2">
          <input
            type="text"
            className="input input-bordered input-sm w-16 text-center"
            value={newLocEmoji}
            onChange={(e) => setNewLocEmoji(e.target.value)}
            placeholder="📍"
            autoFocus
          />
          <input
            type="text"
            className="input input-bordered input-sm flex-1"
            value={newLocName}
            onChange={(e) => setNewLocName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const name = newLocName.trim();
                const emoji = newLocEmoji.trim();
                if (name && emoji && !locations.some((l) => l.name === name)) {
                  addLocation({ name, emoji }); setNewLocName(""); setNewLocEmoji(""); setAddingLoc(false);
                }
              }
            }}
            placeholder="場所名"
          />
          <button className="btn btn-sm btn-primary" onClick={() => {
            const name = newLocName.trim();
            const emoji = newLocEmoji.trim();
            if (name && emoji && !locations.some((l) => l.name === name)) {
              addLocation({ name, emoji }); setNewLocName(""); setNewLocEmoji(""); setAddingLoc(false);
            }
          }}>
            <Icon icon="mdi:check" className="size-4" />
          </button>
          <button className="btn btn-sm btn-ghost" onClick={() => setAddingLoc(false)}>
            <Icon icon="mdi:close" className="size-4" />
          </button>
        </div>
      ) : (
        <button className="btn btn-outline btn-sm self-start" onClick={() => setAddingLoc(true)}>
          <Icon icon="mdi:plus" className="size-4" />
          場所を追加
        </button>
      )}

      <h2 className="text-lg font-bold mt-6">データ管理</h2>
      <div className="flex gap-2">
        <button
          className="btn btn-outline btn-sm"
          onClick={() => {
            if (window.confirm("すべてのデータを初期状態に戻しますか？")) {
              resetToDefaults();
            }
          }}
        >
          <Icon icon="mdi:restart" className="size-4" />
          初期化
        </button>
        <button
          className="btn btn-outline btn-sm btn-error"
          onClick={() => {
            if (window.confirm("すべてのデータを削除しますか？この操作は元に戻せません。")) {
              clearAll();
            }
          }}
        >
          <Icon icon="mdi:delete-forever" className="size-4" />
          全削除
        </button>
      </div>
    </div>
  );
}
