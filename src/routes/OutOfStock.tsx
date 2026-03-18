import { useState } from "react";
import { Icon } from "@iconify/react";
import { useGrocery } from "../context/GroceryContext";
import GroceryList from "../components/GroceryList";

export default function OutOfStock({ locationFilter }: { locationFilter: string | null }) {
  const { outOfStockItems, addOutOfStockItem, updateItemName, removeOutOfStockItem, reorderOutOfStockItems, moveToShopping } =
    useGrocery();
  const filteredItems = locationFilter
    ? outOfStockItems.filter((item) => item.location === locationFilter)
    : outOfStockItems;
  const [editingNewId, setEditingNewId] = useState<number | null>(null);

  const handleAdd = (category?: string) => {
    if (editingNewId !== null) return;
    const id = addOutOfStockItem("", category, locationFilter ?? undefined);
    setEditingNewId(id);
  };

  const handleEditComplete = (id: number, name: string) => {
    updateItemName(id, name);
    setEditingNewId(null);
  };

  const handleEditCancel = (id: number) => {
    removeOutOfStockItem(id);
    setEditingNewId(null);
  };

  return (
    <>
      <GroceryList
        items={filteredItems}
        mode="outOfStock"
        emptyMessage="なくなったものはありません"
        editingNewId={editingNewId}
        onItemClick={moveToShopping}
        onItemRemove={removeOutOfStockItem}
        onItemReorder={reorderOutOfStockItems}
        onAddToCategory={(cat) => handleAdd(cat)}
        onEditNewComplete={handleEditComplete}
        onEditNewCancel={handleEditCancel}
      />

      <div className="fab">
        <button className="btn btn-lg btn-circle btn-primary" onClick={() => handleAdd()}>
          <Icon icon="mdi:plus" className="size-7" />
        </button>
      </div>
    </>
  );
}
