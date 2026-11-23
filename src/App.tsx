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
import NotFound from "./routes/NotFound";
import { usePageMeta, isHeaderHeadingPage } from "./hooks/usePageMeta";
import { UNSET_FILTER } from "./constants";

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

/** ツールバー左側に並べるマスター画面へのリンク */
const MASTER_LINKS = [
  { path: "/master/locations", label: "店", icon: "mdi:store-outline" },
  { path: "/master/categories", label: "カテゴリ", icon: "mdi:tag-outline" },
  { path: "/master/storage-locations", label: "保管場所", icon: "mdi:package-variant" },
];

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

  return (
    <>
      <button className="btn btn-sm btn-ghost btn-square" aria-label="共有" onClick={handleOpen}>
        <Icon icon="mdi:share-variant-outline" className="size-5" />
      </button>
      {open && (
        <ShareDialog
          title={title}
          shareText={buildShareText(title, items, categories.map((c) => c.name))}
          shareUrl={buildShareUrl(isOutOfStock ? "outOfStock" : "shopping", items)}
          fileName={`${title}_${todayYmd()}`}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function todayYmd() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

/** メモ画面の共有。メモは Memo 画面が localStorage に保存しているので、開いた時点の内容を読む */
function MemoShareButton() {
  const { showToast } = useGrocery();
  const [text, setText] = useState<string | null>(null);

  const handleOpen = () => {
    let memo = "";
    try {
      memo = JSON.parse(localStorage.getItem("memo") ?? '""');
    } catch {
      // 読めなければ空として扱う
    }
    if (!memo.trim()) {
      showToast("共有するメモがありません", "mdi:alert-circle-outline");
      return;
    }
    setText(memo);
  };

  return (
    <>
      <button className="btn btn-sm btn-ghost btn-square" aria-label="共有" onClick={handleOpen}>
        <Icon icon="mdi:share-variant-outline" className="size-5" />
      </button>
      {text !== null && (
        <ShareDialog title="メモ" shareText={text} fileName={`メモ_${todayYmd()}`} onClose={() => setText(null)} />
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

/**
 * 共有URL（?list=...）で開かれたら、リストに追加するか確認する。
 * 店・保管場所のタブを選択中なら、追加したアイテムをそのタブに入れる
 */
function SharedListLoader({
  selectedLocation,
  selectedStorageLocation,
}: {
  selectedLocation: string | null;
  selectedStorageLocation: string | null;
}) {
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
        const tab = shared.kind === "shopping" ? selectedLocation : selectedStorageLocation;
        const place = tab && tab !== UNSET_FILTER ? tab : undefined;
        const patch = place ? (shared.kind === "shopping" ? { location: place } : { storageLocation: place }) : undefined;
        const count = importSharedItems(shared.kind, shared.items, patch);
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
  usePageMeta();
  // 画面を移動したり開き直したりしても、選択中のタブを維持する
  const [selectedLocation, setSelectedLocation] = useLocalStorage<string | null>("selected-location", null);
  const [selectedStorageLocation, setSelectedStorageLocation] = useLocalStorage<string | null>(
    "selected-storage-location",
    null,
  );

  const isListPage = location.pathname === "/" || location.pathname === "/out-of-stock";
  const isOutOfStock = location.pathname === "/out-of-stock";
  const isMemoPage = location.pathname === "/memo";

  const mainContent = (
    // リスト画面では横方向のタッチをブラウザに渡さず、タブ切り替えのスワイプに使う
    <main className={`w-full mx-auto max-w-lg px-4 flex-1 min-h-0 overflow-y-auto ${isListPage ? "touch-pan-y" : ""}`}>
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  );

  return (
    <GroceryProvider>
    {/* モバイルのアドレスバーやキーボードで画面の高さが変わってもページ全体がスクロールしないよう、
        表示領域の高さ（dvh）に固定してスクロールは main の中だけで行う */}
    <div className="h-dvh flex flex-col overflow-hidden bg-base-100">
      {/* ボタン内の余白（6px）と合わせて、アイコンが main の左右パディング（16px）に揃うようにする */}
      <header className="navbar min-h-14 gap-2 bg-base-100 px-2.5 py-0 shadow-sm shrink-0 relative z-10">
        <div className="flex-none">
          <HamburgerMenu />
        </div>
        <div className="flex-1 flex items-center gap-2">
          <img src="/logo.png" alt="" className="size-7" />
          {isHeaderHeadingPage(location.pathname) ? (
            <h1 className="text-xl font-bold">買い物リスト</h1>
          ) : (
            <span className="text-xl font-bold">買い物リスト</span>
          )}
        </div>
      </header>
      {(isListPage || isMemoPage) && (
        // ボタン内の余白（6px）と合わせて、アイコンが main の左右パディング（16px）に揃うようにする
        <div className="flex shrink-0 items-center justify-between bg-base-100 px-2.5 pt-2 pb-1">
          <div className="flex items-center gap-1">
            {MASTER_LINKS.map((link) => (
              <button
                key={link.path}
                className="btn btn-sm btn-ghost btn-square"
                aria-label={link.label}
                onClick={() => navigate(link.path)}
              >
                <Icon icon={link.icon} className="size-5" />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <HelpButton />
            {isMemoPage ? <MemoShareButton /> : <ShareButton isOutOfStock={isOutOfStock} />}
            <button className="btn btn-sm btn-ghost btn-square" aria-label="設定" onClick={() => navigate("/settings")}>
              <Icon icon="mdi:cog-outline" className="size-5" />
            </button>
          </div>
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
      {/* 固定配置にせず縦並びの一番下に置き、main がちょうど Dock の上で終わるようにする */}
      <div className="dock static! shrink-0">
        <button
          className={location.pathname === "/memo" ? "dock-active" : ""}
          onClick={() => navigate("/memo")}
        >
          <Icon icon="mdi:file-document-edit-outline" className="size-6" />
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
      <SharedListLoader selectedLocation={selectedLocation} selectedStorageLocation={selectedStorageLocation} />
    </div>
    </GroceryProvider>
  );
}
