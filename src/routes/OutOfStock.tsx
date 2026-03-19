import { useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router";
import { useGrocery } from "../context/GroceryContext";
import GroceryList from "../components/GroceryList";
import { UNSET_FILTER } from "../App";

export default function OutOfStock({ storageLocationFilter }: { storageLocationFilter: string | null }) {
  const navigate = useNavigate();
  const { outOfStockItems, addOutOfStockItem, updateItemName, removeOutOfStockItem, moveToShopping } =
    useGrocery();
  const filteredItems = storageLocationFilter === null
    ? outOfStockItems
    : storageLocationFilter === UNSET_FILTER
      ? outOfStockItems.filter((item) => !item.storageLocation)
      : outOfStockItems.filter((item) => item.storageLocation === storageLocationFilter);
  const [editingNewId, setEditingNewId] = useState<number | null>(null);

  const handleAdd = (category?: string) => {
    if (editingNewId !== null) return;
    const id = addOutOfStockItem("", category, undefined, storageLocationFilter ?? undefined);
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
        emptyMessage={<>
          <p>なくなったものはありません</p>
          <p>
            <button className="link link-primary inline-flex items-center gap-1" onClick={() => navigate("/")}>
              <Icon icon="mdi:cart-outline" className="size-4" />お買いもの
            </button>
            {" "}タブで購入したものをタップ
          </p>
        </>}
        editingNewId={editingNewId}
        onItemClick={moveToShopping}
        onItemRemove={removeOutOfStockItem}
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
