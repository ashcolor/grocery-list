import { Icon } from "@iconify/react";
import { useNavigate } from "react-router";
import { useGrocery } from "../context/GroceryContext";
import { useEditingNewItem } from "../hooks/useEditingNewItem";
import { UNSET_FILTER } from "../constants";
import GroceryList from "../components/GroceryList";

export default function OutOfStock({ storageLocationFilter }: { storageLocationFilter: string | null }) {
  const navigate = useNavigate();
  const { shoppingItems, outOfStockItems, addOutOfStockItem, updateItemName, removeOutOfStockItem, moveToShopping, moveToOutOfStock, showToast } =
    useGrocery();

  const filteredItems = storageLocationFilter === null
    ? outOfStockItems
    : storageLocationFilter === UNSET_FILTER
      ? outOfStockItems.filter((item) => !item.storageLocation)
      : outOfStockItems.filter((item) => item.storageLocation === storageLocationFilter);

  const { editingNewId, handleAdd, handleEditComplete, handleEditCancel } = useEditingNewItem({
    addItem: addOutOfStockItem,
    updateItemName,
    removeItem: removeOutOfStockItem,
    extraAddArgs: [undefined, storageLocationFilter ?? undefined],
    currentItems: outOfStockItems,
    otherItems: shoppingItems,
    moveFromOther: moveToOutOfStock,
    showToast,
  });

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
        suggestItems={shoppingItems}
      />

      <div className="fab">
        <button className="btn btn-lg btn-circle btn-primary" onClick={() => handleAdd()}>
          <Icon icon="mdi:plus" className="size-7" />
        </button>
      </div>
    </>
  );
}
