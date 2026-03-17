import { useState, useRef } from "react";
import { Icon } from "@iconify/react";
import { useGrocery } from "../context/GroceryContext";
import GroceryList from "../components/GroceryList";

export default function Home() {
  const { shoppingItems, addShoppingItem, removeShoppingItem, moveToOutOfStock } =
    useGrocery();
  const [showModal, setShowModal] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const openModal = () => {
    setShowModal(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const addItem = () => {
    const name = input.trim();
    if (!name) return;
    addShoppingItem(name);
    setInput("");
  };

  return (
    <>
      <GroceryList
        items={shoppingItems}
        emptyMessage="リストは空です"
        onItemClick={moveToOutOfStock}
        onItemRemove={removeShoppingItem}
      />

      <div className="fab">
        <button className="btn btn-lg btn-circle btn-primary" onClick={openModal}>
          <Icon icon="mdi:plus" className="size-7" />
        </button>
      </div>

      {showModal && (
        <dialog className="modal modal-open" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">アイテムを追加</h3>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                className="input input-bordered flex-1"
                placeholder="アイテム名..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addItem()}
              />
              <button className="btn btn-primary" onClick={addItem}>
                追加
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
