import { Icon } from "@iconify/react";
import { useNavigate } from "react-router";
import { useGrocery } from "../context/GroceryContext";
import { useEditingNewItem } from "../hooks/useEditingNewItem";
import { UNSET_FILTER } from "../constants";
import GroceryList from "../components/GroceryList";

export default function Home({ locationFilter }: { locationFilter: string | null }) {
  const navigate = useNavigate();
  const { shoppingItems, outOfStockItems, addShoppingItem, removeShoppingItem, moveToOutOfStock, moveToShopping, showToast } =
    useGrocery();

  const filteredItems = locationFilter === null
    ? shoppingItems
    : locationFilter === UNSET_FILTER
      ? shoppingItems.filter((item) => !item.location)
      : shoppingItems.filter((item) => item.location === locationFilter);

  const { editingNewCategory, handleAdd, handleEditComplete, handleEditCancel } = useEditingNewItem({
    addItem: addShoppingItem,
    extraAddArgs: [locationFilter ?? undefined],
    currentItems: shoppingItems,
    otherItems: outOfStockItems,
    moveFromOther: moveToShopping,
    showToast,
  });

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
        editingNewCategory={editingNewCategory}
        onItemClick={moveToOutOfStock}
        onItemRemove={removeShoppingItem}
        onAddToCategory={(cat) => handleAdd(cat)}
        onEditNewComplete={handleEditComplete}
        onEditNewCancel={handleEditCancel}
        suggestItems={outOfStockItems}
      />

      <div className="fab">
        <button className="btn btn-lg btn-circle btn-primary" onClick={() => handleAdd()}>
          <Icon icon="mdi:plus" className="size-7" />
        </button>
      </div>
    </>
  );
}
