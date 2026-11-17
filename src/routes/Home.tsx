import { Icon } from "@iconify/react";
import { useGrocery } from "../context/GroceryContext";
import { useEditingNewItem } from "../hooks/useEditingNewItem";
import { UNSET_FILTER } from "../constants";
import GroceryList from "../components/GroceryList";

export default function Home({ locationFilter }: { locationFilter: string | null }) {
  const { locations, shoppingItems, outOfStockItems, addShoppingItem, removeShoppingItem, moveToOutOfStock, moveToShopping, showToast } =
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
      {/* タブを切り替えたら作り直して、一番下までスクロールさせる */}
      <GroceryList
        key={locationFilter ?? ""}
        items={filteredItems}
        mode="shopping"
        editingNewCategory={editingNewCategory}
        onItemClick={moveToOutOfStock}
        onItemRemove={removeShoppingItem}
        onAddToCategory={(cat) => handleAdd(cat)}
        onEditNewComplete={handleEditComplete}
        onEditNewCancel={handleEditCancel}
        suggestItems={outOfStockItems}
        headerImage={locations.find((l) => l.name === locationFilter)?.image}
      />

      <div className="fab">
        <button className="btn btn-lg btn-circle btn-primary" onClick={() => handleAdd()}>
          <Icon icon="mdi:plus" className="size-7" />
        </button>
      </div>
    </>
  );
}
