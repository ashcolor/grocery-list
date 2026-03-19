import { useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router";
import { useGrocery } from "../context/GroceryContext";
import GroceryList from "../components/GroceryList";
import { UNSET_FILTER } from "../App";

export default function Home({ locationFilter }: { locationFilter: string | null }) {
  const navigate = useNavigate();
  const { shoppingItems, addShoppingItem, updateItemName, removeShoppingItem, moveToOutOfStock } =
    useGrocery();
  const filteredItems = locationFilter === null
    ? shoppingItems
    : locationFilter === UNSET_FILTER
      ? shoppingItems.filter((item) => !item.location)
      : shoppingItems.filter((item) => item.location === locationFilter);
  const [editingNewId, setEditingNewId] = useState<number | null>(null);

  const handleAdd = (category?: string) => {
    if (editingNewId !== null) return;
    const id = addShoppingItem("", category, locationFilter ?? undefined);
    setEditingNewId(id);
  };

  const handleEditComplete = (id: number, name: string) => {
    updateItemName(id, name);
    setEditingNewId(null);
  };

  const handleEditCancel = (id: number) => {
    removeShoppingItem(id);
    setEditingNewId(null);
  };

  return (
    <>
      <GroceryList
        items={filteredItems}
        mode="shopping"
        emptyMessage={<>
          <p>リストは空です</p>
          <p>
            <button className="link link-primary inline-flex items-center gap-1" onClick={() => navigate("/out-of-stock")}>
              <Icon icon="mdi:vanish" className="size-4" />なくなった
            </button>
            {" "}タブから必要なものをタップ
          </p>
        </>}
        editingNewId={editingNewId}
        onItemClick={moveToOutOfStock}
        onItemRemove={removeShoppingItem}
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
