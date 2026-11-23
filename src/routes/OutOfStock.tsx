import { Icon } from "@iconify/react";
import { useGrocery } from "../context/GroceryContext";
import { useEditingNewItem } from "../hooks/useEditingNewItem";
import { UNSET_FILTER } from "../constants";
import { matchesPlaceFilter, placeLabel } from "../utils/placeFilter";
import GroceryList from "../components/GroceryList";

export default function OutOfStock({ storageLocationFilter }: { storageLocationFilter: string | null }) {
  const {
    storageLocations,
    shoppingItems,
    outOfStockItems,
    addOutOfStockItem,
    removeOutOfStockItem,
    moveToShopping,
    moveToOutOfStock,
    updateItemStorageLocation,
    showToast,
  } = useGrocery();

  const filteredItems = outOfStockItems.filter((item) =>
    matchesPlaceFilter(item.storageLocation, storageLocationFilter),
  );

  // 保管場所のタブを選択中なら、追加・移動したアイテムにその保管場所を設定する（「すべて」「未設定」では設定しない）
  const tabStorageLocation =
    storageLocationFilter && storageLocationFilter !== UNSET_FILTER ? storageLocationFilter : undefined;

  const { editingNewCategory, handleAdd, handleEditComplete, handleEditCancel } = useEditingNewItem({
    addItem: addOutOfStockItem,
    extraAddArgs: [undefined, tabStorageLocation],
    currentItems: outOfStockItems,
    otherItems: shoppingItems,
    moveFromOther: (id) =>
      moveToOutOfStock(id, tabStorageLocation ? { patch: { storageLocation: tabStorageLocation } } : undefined),
    showToast,
    isInCurrentTab: (item) => matchesPlaceFilter(item.storageLocation, storageLocationFilter),
    describeTab: (item) => placeLabel(item.storageLocation, storageLocations),
    moveToCurrentTabLabel: tabStorageLocation ? `${tabStorageLocation}に移動` : "未設定にする",
    moveToCurrentTab: (item) => {
      updateItemStorageLocation(item.id, tabStorageLocation);
      showToast(
        `${item.name}の保管場所を${placeLabel(tabStorageLocation, storageLocations)}に変更`,
        "mdi:package-variant",
        () => updateItemStorageLocation(item.id, item.storageLocation),
      );
    },
  });

  return (
    <>
      {/* タブを切り替えたら作り直して、一番下までスクロールさせる */}
      <GroceryList
        key={storageLocationFilter ?? ""}
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
