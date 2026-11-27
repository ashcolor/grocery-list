import { useGrocery } from "../context/GroceryContext";
import { SettingsSection } from "../components/SettingsSection";
import { PageLayout } from "../components/PageLayout";

function MasterPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <PageLayout title={title}>
      {/* 買い物リストと同じく、リストを下に寄せて積み上げる。下の余白は右下の追加ボタン（3rem）と上下の隙間 1rem ずつ */}
      <div className="flex flex-1 flex-col justify-end gap-4 pb-16">{children}</div>
    </PageLayout>
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
