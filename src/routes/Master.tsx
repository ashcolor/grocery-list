import { useLocation, useNavigate } from "react-router";
import { Icon } from "@iconify/react";
import { useGrocery } from "../context/GroceryContext";
import { SettingsSection } from "../components/SettingsSection";

function MasterPage({ title, children }: { title: string; children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  // 直接開いたなど戻る先の履歴がないときは、買い物リストへ移動する
  const goBack = () => {
    if (location.key === "default") navigate("/");
    else navigate(-1);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-1">
        {/* ボタン内の余白の分だけ左にずらし、アイコンを本文の左端に揃える */}
        <button className="btn btn-ghost btn-sm btn-square -ml-1.5" aria-label="戻る" onClick={goBack}>
          <Icon icon="mdi:arrow-left" className="size-6" />
        </button>
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      {children}
    </div>
  );
}

export function LocationsMaster() {
  const { locations, addLocation, removeLocation, updateLocation, reorderLocations } = useGrocery();
  return (
    <MasterPage title="店">
      <SettingsSection
        items={locations}
        addLabel="店を追加"
        emojiPlaceholder="📍"
        namePlaceholder="店名"
        onAdd={addLocation}
        onRemove={removeLocation}
        onUpdate={updateLocation}
        onReorder={reorderLocations}
        withImage
      />
    </MasterPage>
  );
}

export function CategoriesMaster() {
  const { categories, addCategory, removeCategory, updateCategory, reorderCategories } = useGrocery();
  return (
    <MasterPage title="カテゴリ">
      <SettingsSection
        items={categories}
        addLabel="カテゴリを追加"
        namePlaceholder="カテゴリ名"
        unsetLabel="その他"
        onAdd={addCategory}
        onRemove={removeCategory}
        onUpdate={updateCategory}
        onReorder={reorderCategories}
      />
    </MasterPage>
  );
}

export function StorageLocationsMaster() {
  const { storageLocations, addStorageLocation, removeStorageLocation, updateStorageLocation, reorderStorageLocations } =
    useGrocery();
  return (
    <MasterPage title="保管場所">
      <SettingsSection
        items={storageLocations}
        idPrefix="storage"
        addLabel="保管場所を追加"
        emojiPlaceholder="📍"
        namePlaceholder="保管場所名"
        onAdd={addStorageLocation}
        onRemove={removeStorageLocation}
        onUpdate={updateStorageLocation}
        onReorder={reorderStorageLocations}
      />
    </MasterPage>
  );
}
