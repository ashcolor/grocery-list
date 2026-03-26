import { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router";
import { Icon } from "@iconify/react";
import { GroceryProvider, useGrocery } from "./context/GroceryContext";
import { HamburgerMenu } from "./components/HamburgerMenu";
import { FilterTabs } from "./components/FilterTabs";
import { ListDndProvider } from "./components/ListDndProvider";
import Home from "./routes/Home";
import OutOfStock from "./routes/OutOfStock";
import Settings from "./routes/Settings";
import PrivacyPolicy from "./routes/PrivacyPolicy";
import TermsOfService from "./routes/TermsOfService";
import OperatorInfo from "./routes/OperatorInfo";
import Memo from "./routes/Memo";

function LocationFilter({ selected, onSelect }: { selected: string | null; onSelect: (v: string | null) => void }) {
  const { locations } = useGrocery();
  return <FilterTabs items={locations} selected={selected} onSelect={onSelect} icon="mdi:store" droppablePrefix="loc" />;
}

function StorageLocationFilter({ selected, onSelect }: { selected: string | null; onSelect: (v: string | null) => void }) {
  const { storageLocations } = useGrocery();
  return <FilterTabs items={storageLocations} selected={selected} onSelect={onSelect} icon="mdi:package-variant" droppablePrefix="sloc" />;
}

function ShareButton({ isOutOfStock }: { isOutOfStock: boolean }) {
  const { shoppingItems, outOfStockItems, showToast } = useGrocery();

  const handleShare = async () => {
    const items = isOutOfStock ? outOfStockItems : shoppingItems;
    if (items.length === 0) {
      showToast("共有するアイテムがありません", "mdi:alert-circle-outline");
      return;
    }
    const title = isOutOfStock ? "なくなったもの" : "お買い物リスト";
    const text = items.map((item) => `・${item.name}`).join("\n");
    const body = `${title}\n${text}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text: body });
      } catch (e) {
        if ((e as DOMException).name !== "AbortError") {
          showToast("共有に失敗しました", "mdi:alert-circle-outline");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(body);
        showToast("クリップボードにコピーしました", "mdi:clipboard-check-outline");
      } catch {
        showToast("コピーに失敗しました", "mdi:alert-circle-outline");
      }
    }
  };

  return (
    <button className="btn btn-sm btn-ghost" aria-label="共有" onClick={handleShare}>
      <Icon icon="mdi:share-variant" className="size-5" />
    </button>
  );
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedStorageLocation, setSelectedStorageLocation] = useState<string | null>(null);

  useEffect(() => {
    setSelectedLocation(null);
    setSelectedStorageLocation(null);
  }, [location.pathname]);

  const isListPage = location.pathname === "/" || location.pathname === "/out-of-stock";
  const isOutOfStock = location.pathname === "/out-of-stock";
  const isMemoPage = location.pathname === "/memo";

  const mainContent = (
    <main className="container mx-auto max-w-lg p-4 pb-20 flex-1 overflow-y-auto">
      <Routes>
        <Route path="/" element={<Home locationFilter={selectedLocation} />} />
        <Route path="/out-of-stock" element={<OutOfStock storageLocationFilter={selectedStorageLocation} />} />
        <Route path="/settings" element={<Settings />} />
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
        <div className="flex-1">
          <span className="text-xl font-bold">買い物リスト</span>
        </div>
      </header>
      {(isListPage || isMemoPage) && (
        <div className="flex justify-end gap-1 bg-base-100 px-2 py-1">
          {isListPage && (
            <>
              <ShareButton isOutOfStock={isOutOfStock} />
              <button className="btn btn-sm btn-ghost" aria-label="設定" onClick={() => navigate("/settings")}>
                <Icon icon="fa6-solid:gear" className="size-5" />
              </button>
            </>
          )}
          {isMemoPage && (
            <button
              className="btn btn-sm btn-ghost"
              aria-label="画像を追加"
              onClick={() => window.dispatchEvent(new CustomEvent("memo:add-image"))}
            >
              <Icon icon="mdi:image-plus" className="size-5" />
            </button>
          )}
        </div>
      )}
      {isListPage ? (
        <ListDndProvider mode={isOutOfStock ? "outOfStock" : "shopping"}>
          {!isOutOfStock && <LocationFilter selected={selectedLocation} onSelect={setSelectedLocation} />}
          {isOutOfStock && <StorageLocationFilter selected={selectedStorageLocation} onSelect={setSelectedStorageLocation} />}
          {mainContent}
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
          <span className="dock-label">お買いもの</span>
        </button>
        <button
          className={location.pathname === "/out-of-stock" ? "dock-active" : ""}
          onClick={() => navigate("/out-of-stock")}
        >
          <Icon icon="mdi:cube-outline" className="size-6" />
          <span className="dock-label">なくなった</span>
        </button>
      </div>
    </div>
    </GroceryProvider>
  );
}
