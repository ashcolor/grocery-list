import { useGrocery } from "../context/GroceryContext";
import { SettingsSection } from "../components/SettingsSection";
import { PageLayout } from "../components/PageLayout";

function MasterPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <PageLayout title={title}>
      <div className="flex flex-col gap-4">{children}</div>
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
