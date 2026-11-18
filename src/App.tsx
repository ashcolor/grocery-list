import { useEffect, useState } from "react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { Routes, Route, useLocation, useNavigate } from "react-router";
import { ShareDialog } from "./components/ShareDialog";
import { HelpDialog } from "./components/HelpDialog";
import { NamedItemModal } from "./components/NamedItemModal";
import type { NamedItem } from "./types";
import { ConfirmModal } from "./components/ConfirmModal";
import { SHARE_QUERY_KEY, buildShareText, buildShareUrl, parseSharedList } from "./utils/shareList";
import { Icon } from "@iconify/react";
import { GroceryProvider, useGrocery } from "./context/GroceryContext";
import { HamburgerMenu } from "./components/HamburgerMenu";
import { FilterTabs } from "./components/FilterTabs";
import { ListDndProvider } from "./components/ListDndProvider";
import { SwipeTabArea } from "./components/SwipeTabArea";
import { DuplicateItemsModal } from "./components/DuplicateItemsModal";
import Home from "./routes/Home";
import OutOfStock from "./routes/OutOfStock";
import Settings from "./routes/Settings";
import { LocationsMaster, CategoriesMaster, StorageLocationsMaster } from "./routes/Master";
import PrivacyPolicy from "./routes/PrivacyPolicy";
import TermsOfService from "./routes/TermsOfService";
import OperatorInfo from "./routes/OperatorInfo";
import Memo from "./routes/Memo";

/** 選択中のタブをもう一度タップすると、その項目（店・保管場所）を編集できるタブ */
function EditableFilterTabs({
  items,
  selected,
  onSelect,
  droppablePrefix,
  namePlaceholder,
  withImage,
  onUpdate,
  onRemove,
}: {
  items: NamedItem[];
  selected: string | null;
  onSelect: (v: string | null) => void;
  droppablePrefix: string;
  namePlaceholder: string;
  withImage?: boolean;
  onUpdate: (oldName: string, updated: NamedItem) => void;
  onRemove: (name: string) => void;
}) {
  /** 編集中の項目名。閉じているときは null */
  const [editingName, setEditingName] = useState<string | null>(null);
  const editingItem = items.find((i) => i.name === editingName);

  const handleSave = (item: NamedItem): string | null => {
    if (!editingItem) return null;
    if (items.some((i) => i.name === item.name && i.name !== editingItem.name)) return "同じ名前がすでにあります";
    onUpdate(editingItem.name, item);
    // 名前を変えても同じ項目を編集・選択し続けられるよう追従させる
    setEditingName(item.name);
    onSelect(item.name);
    return null;
  };

  return (
    <>
      <FilterTabs
        items={items}
        selected={selected}
        onSelect={onSelect}
        droppablePrefix={droppablePrefix}
        onActiveTabClick={(item) => setEditingName(item.name)}
      />
      {editingItem && (
        <NamedItemModal
          title={`${editingItem.name}を編集`}
          initial={editingItem}
          emojiPlaceholder="📍"
          namePlaceholder={namePlaceholder}
          withImage={withImage}
          onSave={handleSave}
          onDelete={() => onRemove(editingItem.name)}
          onClose={() => setEditingName(null)}
        />
      )}
    </>
  );
}

function LocationFilter({ selected, onSelect }: { selected: string | null; onSelect: (v: string | null) => void }) {
  const { locations, updateLocation, removeLocation } = useGrocery();
  return (
    <EditableFilterTabs
      items={locations}
      selected={selected}
      onSelect={onSelect}
      droppablePrefix="loc"
      namePlaceholder="店名"
      withImage
      onUpdate={updateLocation}
      onRemove={removeLocation}
    />
  );
}

/** リスト画面で、左右スワイプで店・保管場所のタブを切り替える */
function ListSwipeArea({
  isOutOfStock,
  selected,
  onSelect,
  children,
}: {
  isOutOfStock: boolean;
  selected: string | null;
  onSelect: (v: string | null) => void;
  children: React.ReactNode;
}) {
  const { locations, storageLocations } = useGrocery();
  return (
    <SwipeTabArea items={isOutOfStock ? storageLocations : locations} selected={selected} onSelect={onSelect}>
      {children}
    </SwipeTabArea>
  );
}

function StorageLocationFilter({ selected, onSelect }: { selected: string | null; onSelect: (v: string | null) => void }) {
  const { storageLocations, updateStorageLocation, removeStorageLocation } = useGrocery();
  return (
    <EditableFilterTabs
      items={storageLocations}
      selected={selected}
      onSelect={onSelect}
      droppablePrefix="sloc"
      namePlaceholder="保管場所名"
      onUpdate={updateStorageLocation}
      onRemove={removeStorageLocation}
    />
  );
}

function ShareButton({ isOutOfStock }: { isOutOfStock: boolean }) {
  const { shoppingItems, outOfStockItems, categories, showToast } = useGrocery();
  const [open, setOpen] = useState(false);

  const items = isOutOfStock ? outOfStockItems : shoppingItems;
  const title = isOutOfStock ? "なくなったもの" : "買い物リスト";

  const handleOpen = () => {
    if (items.length === 0) {
      showToast("共有するアイテムがありません", "mdi:alert-circle-outline");
      return;
    }
    setOpen(true);
  };

  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

  return (
    <>
      <button className="btn btn-sm btn-ghost btn-square" aria-label="共有" onClick={handleOpen}>
        <Icon icon="mdi:share-variant" className="size-5" />
      </button>
      {open && (
        <ShareDialog
          title={title}
          shareText={buildShareText(title, items, categories.map((c) => c.name))}
          shareUrl={buildShareUrl(isOutOfStock ? "outOfStock" : "shopping", items)}
          fileName={`${title}_${ymd}`}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function HelpButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn btn-sm btn-ghost btn-square" aria-label="使い方" onClick={() => setOpen(true)}>
        <Icon icon="mdi:information-outline" className="size-5" />
      </button>
      {open && <HelpDialog onClose={() => setOpen(false)} />}
    </>
  );
}

/** 共有URL（?list=...）で開かれたら、リストに追加するか確認する */
function SharedListLoader() {
  const { importSharedItems, showToast } = useGrocery();
  const location = useLocation();
  const navigate = useNavigate();
  const encoded = new URLSearchParams(location.search).get(SHARE_QUERY_KEY);
  const shared = encoded ? parseSharedList(encoded) : null;

  // URLからクエリを外して、再読み込みで何度も聞かれないようにする
  const clearQuery = () => navigate(location.pathname, { replace: true });

  useEffect(() => {
    if (encoded && !shared) {
      showToast("共有URLを読み込めませんでした", "mdi:alert-circle-outline");
      navigate(location.pathname, { replace: true });
    }
  }, [encoded, shared, showToast, navigate, location.pathname]);

  if (!shared) return null;
  const listName = shared.kind === "shopping" ? "買い物" : "なくなった";

  return (
    <ConfirmModal
      title="共有されたリスト"
      confirmLabel="追加"
      onConfirm={() => {
        const count = importSharedItems(shared.kind, shared.items);
        showToast(
          count > 0 ? `${count}件を「${listName}」に追加しました` : "追加するアイテムはありませんでした",
          "mdi:cart-plus",
        );
        clearQuery();
      }}
      onCancel={clearQuery}
    >
      <p>「{listName}」に、次の{shared.items.length}件を追加しますか？</p>
      <p className="text-base-content/60">すでにあるアイテムは追加しません。</p>
      <ul className="mt-3 flex max-h-56 flex-wrap gap-1 overflow-y-auto">
        {shared.items.map((item, index) => (
          <li key={index} className="badge badge-ghost">
            {item.name}
          </li>
        ))}
      </ul>
    </ConfirmModal>
  );
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  // 画面を移動したり開き直したりしても、選択中のタブを維持する
  const [selectedLocation, setSelectedLocation] = useLocalStorage<string | null>("selected-location", null);
  const [selectedStorageLocation, setSelectedStorageLocation] = useLocalStorage<string | null>(
    "selected-storage-location",
    null,
  );

  const isListPage = location.pathname === "/" || location.pathname === "/out-of-stock";
  const isOutOfStock = location.pathname === "/out-of-stock";

  const mainContent = (
    // リスト画面では横方向のタッチをブラウザに渡さず、タブ切り替えのスワイプに使う
    <main className={`container mx-auto max-w-lg p-4 pb-20 scroll-pb-20 flex-1 overflow-y-auto ${isListPage ? "touch-pan-y" : ""}`}>
      <Routes>
        <Route path="/" element={<Home locationFilter={selectedLocation} />} />
        <Route path="/out-of-stock" element={<OutOfStock storageLocationFilter={selectedStorageLocation} />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/master/locations" element={<LocationsMaster />} />
        <Route path="/master/categories" element={<CategoriesMaster />} />
        <Route path="/master/storage-locations" element={<StorageLocationsMaster />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/memo" element={<Memo />} />
        <Route path="/operator" element={<OperatorInfo />} />
      </Routes>
    </main>
  );

  return (
    <GroceryProvider>
    <div className="h-screen flex flex-col bg-base-100">
      <header className="navbar bg-base-100 shadow-sm">
        <div className="flex-none">
          <HamburgerMenu />
        </div>
        <div className="flex-1 flex items-center gap-2">
          <img src="/logo.png" alt="" className="size-7" />
          <span className="text-xl font-bold">買い物リスト</span>
        </div>
      </header>
      {isListPage && (
        <div className="flex justify-end gap-1 bg-base-100 px-2 py-1">
          <HelpButton />
          <ShareButton isOutOfStock={isOutOfStock} />
        </div>
      )}
      {isListPage ? (
        <ListDndProvider mode={isOutOfStock ? "outOfStock" : "shopping"}>
          {!isOutOfStock && <LocationFilter selected={selectedLocation} onSelect={setSelectedLocation} />}
          {isOutOfStock && <StorageLocationFilter selected={selectedStorageLocation} onSelect={setSelectedStorageLocation} />}
          <ListSwipeArea
            isOutOfStock={isOutOfStock}
            selected={isOutOfStock ? selectedStorageLocation : selectedLocation}
            onSelect={isOutOfStock ? setSelectedStorageLocation : setSelectedLocation}
          >
            {mainContent}
          </ListSwipeArea>
        </ListDndProvider>
      ) : mainContent}
      <div className="dock">
        <button
          className={location.pathname === "/memo" ? "dock-active" : ""}
          onClick={() => navigate("/memo")}
        >
          <Icon icon="mdi:note-outline" className="size-6" />
          <span className="dock-label">メモ</span>
        </button>
        <button
          className={location.pathname === "/" ? "dock-active" : ""}
          onClick={() => navigate("/")}
        >
          <Icon icon="mdi:cart-outline" className="size-6" />
          <span className="dock-label">買い物</span>
        </button>
        <button
          className={location.pathname === "/out-of-stock" ? "dock-active" : ""}
          onClick={() => navigate("/out-of-stock")}
        >
          <Icon icon="mdi:cube-outline" className="size-6" />
          <span className="dock-label">なくなった</span>
        </button>
      </div>
      <DuplicateItemsModal />
      <SharedListLoader />
    </div>
    </GroceryProvider>
  );
}
