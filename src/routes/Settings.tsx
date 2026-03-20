import { useNavigate } from "react-router";
import { Icon } from "@iconify/react";
import { useGrocery } from "../context/GroceryContext";
import { SettingsSection } from "../components/SettingsSection";

export default function Settings() {
  const navigate = useNavigate();
  const {
    categories, addCategory, removeCategory, updateCategory, reorderCategories,
    locations, addLocation, removeLocation, updateLocation, reorderLocations,
    storageLocations, addStorageLocation, removeStorageLocation, updateStorageLocation, reorderStorageLocations,
    resetToDefaults, clearAll,
  } = useGrocery();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">設定</h1>
        <button className="btn btn-sm btn-ghost" aria-label="閉じる" onClick={() => navigate(-1)}>
          <Icon icon="mdi:close" className="size-5" />
        </button>
      </div>

      <SettingsSection
        title="カテゴリ"
        items={categories}
        addLabel="カテゴリを追加"
        namePlaceholder="カテゴリ名"
        onAdd={addCategory}
        onRemove={removeCategory}
        onUpdate={updateCategory}
        onReorder={reorderCategories}
      />

      <SettingsSection
        title="店"
        items={locations}
        addLabel="店を追加"
        emojiPlaceholder="📍"
        namePlaceholder="店名"
        onAdd={addLocation}
        onRemove={removeLocation}
        onUpdate={updateLocation}
        onReorder={reorderLocations}
      />

      <SettingsSection
        title="保管場所"
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
