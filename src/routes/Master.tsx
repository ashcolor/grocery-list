import { useGrocery } from "../context/GroceryContext";
import { SettingsSection } from "../components/SettingsSection";

function MasterPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{title}</h1>
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
