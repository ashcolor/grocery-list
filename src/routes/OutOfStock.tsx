import { Icon } from "@iconify/react";
import { useGrocery } from "../context/GroceryContext";
import { useEditingNewItem } from "../hooks/useEditingNewItem";
import { UNSET_FILTER } from "../constants";
import GroceryList from "../components/GroceryList";

export default function OutOfStock({ storageLocationFilter }: { storageLocationFilter: string | null }) {
  const { shoppingItems, outOfStockItems, addOutOfStockItem, removeOutOfStockItem, moveToShopping, moveToOutOfStock, showToast } =
    useGrocery();

  const filteredItems = storageLocationFilter === null
    ? outOfStockItems
    : storageLocationFilter === UNSET_FILTER
      ? outOfStockItems.filter((item) => !item.storageLocation)
      : outOfStockItems.filter((item) => item.storageLocation === storageLocationFilter);

  const { editingNewCategory, handleAdd, handleEditComplete, handleEditCancel } = useEditingNewItem({
    addItem: addOutOfStockItem,
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
        editingNewCategory={editingNewCategory}
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
