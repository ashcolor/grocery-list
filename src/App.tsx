import { useState, useCallback, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router";
import { Icon } from "@iconify/react";
import { GroceryProvider, useGrocery } from "./context/GroceryContext";
import { HamburgerMenu } from "./components/HamburgerMenu";
import Home from "./routes/Home";
import OutOfStock from "./routes/OutOfStock";
import Settings from "./routes/Settings";
import PrivacyPolicy from "./routes/PrivacyPolicy";
import TermsOfService from "./routes/TermsOfService";
import OperatorInfo from "./routes/OperatorInfo";
import {
  DndContext,
  closestCenter,
  pointerWithin,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  type CollisionDetection,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

export const UNSET_FILTER = "__unset__";

function DroppableTab({
  id,
  isActive,
  onClick,
  children,
}: {
  id: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <a
      ref={setNodeRef}
      role="tab"
      className={`tab ${isActive ? "tab-active" : ""} ${isOver ? "bg-primary/20! border-primary!" : ""}`}
      onClick={onClick}
    >
      {children}
    </a>
  );
}

function LocationTabs({ selected, onSelect }: { selected: string | null; onSelect: (loc: string | null) => void }) {
  const { locations } = useGrocery();
  if (locations.length === 0) return null;
  return (
    <div className="bg-base-100 overflow-x-auto">
      <div className="flex items-center">
        <span className="pl-3 text-xs text-base-content/50 shrink-0 flex items-center gap-1">
          <Icon icon="mdi:store" className="size-4" />
        </span>
        <div role="tablist" className="tabs tabs-border flex-1">
          <a
            role="tab"
            className={`tab ${selected === null ? "tab-active" : ""}`}
            onClick={() => onSelect(null)}
          >
            すべて
          </a>
          {locations.map((loc) => (
            <DroppableTab
              key={loc.name}
              id={`loc-tab-${loc.name}`}
              isActive={selected === loc.name}
              onClick={() => onSelect(loc.name)}
            >
              {loc.emoji} {loc.name}
            </DroppableTab>
          ))}
          <DroppableTab
            id="loc-tab-__unset__"
            isActive={selected === UNSET_FILTER}
            onClick={() => onSelect(UNSET_FILTER)}
          >
            その他
          </DroppableTab>
        </div>
      </div>
    </div>
  );
}

function StorageLocationTabs({ selected, onSelect }: { selected: string | null; onSelect: (loc: string | null) => void }) {
  const { storageLocations } = useGrocery();
  if (storageLocations.length === 0) return null;
  return (
    <div className="bg-base-100 overflow-x-auto">
      <div className="flex items-center">
        <span className="pl-3 text-xs text-base-content/50 shrink-0 flex items-center gap-1">
          <Icon icon="mdi:package-variant" className="size-4" />
        </span>
        <div role="tablist" className="tabs tabs-border flex-1">
          <a
            role="tab"
            className={`tab ${selected === null ? "tab-active" : ""}`}
            onClick={() => onSelect(null)}
          >
            すべて
          </a>
          {storageLocations.map((loc) => (
            <DroppableTab
              key={loc.name}
              id={`sloc-tab-${loc.name}`}
              isActive={selected === loc.name}
              onClick={() => onSelect(loc.name)}
            >
              {loc.emoji} {loc.name}
            </DroppableTab>
          ))}
          <DroppableTab
            id="sloc-tab-__unset__"
            isActive={selected === UNSET_FILTER}
            onClick={() => onSelect(UNSET_FILTER)}
          >
            その他
          </DroppableTab>
        </div>
      </div>
    </div>
  );
}

function ListDndProvider({
  mode,
  children,
}: {
  mode: "shopping" | "outOfStock";
  children: React.ReactNode;
}) {
  const {
    shoppingItems,
    outOfStockItems,
    categories,
    updateItemCategory,
    reorderCategories,
    reorderShoppingItems,
    reorderOutOfStockItems,
    updateItemLocation,
    updateItemStorageLocation,
    locations,
    storageLocations,
    showToast,
  } = useGrocery();

  const items = mode === "shopping" ? shoppingItems : outOfStockItems;
  const onItemReorder = mode === "shopping" ? reorderShoppingItems : reorderOutOfStockItems;

  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const collisionDetection: CollisionDetection = useCallback((args) => {
    const within = pointerWithin(args);
    if (within.length > 0) {
      // When dragging a category, only consider other category targets
      if (typeof args.active.id === "string") {
        const catOnly = within.filter((c) => String(c.id).startsWith("cat-"));
        return catOnly.length > 0 ? catOnly : within;
      }
      return within;
    }
    if (typeof args.active.id === "number") return [];
    return closestCenter(args);
  }, []);

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    if (typeof active.id !== "number" || typeof over.id !== "number") return;

    const activeItem = items.find((i) => i.id === active.id);
    const overItem = items.find((i) => i.id === over.id);
    if (activeItem && overItem && activeItem.category !== overItem.category) {
      updateItemCategory(active.id as number, overItem.category);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    // Item dropped on a string-id target (tab or category container)
    if (typeof active.id === "number" && over && typeof over.id === "string") {
      const overId = over.id as string;
      const itemId = active.id as number;
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      // Location tab drop
      if (overId.startsWith("loc-tab-")) {
        if (overId === "loc-tab-__all__") return;
        const locName = overId === "loc-tab-__unset__" ? undefined : overId.slice(8);
        if (item.location !== locName) {
          const prevLocation = item.location;
          updateItemLocation(itemId, locName);
          const loc = locations.find((l) => l.name === locName);
          const label = loc ? `${loc.emoji} ${loc.name}` : "その他";
          showToast(`${item.name}の店を${label}に設定`, "mdi:store", () => {
            updateItemLocation(itemId, prevLocation);
          });
        }
        return;
      }

      // Storage location tab drop
      if (overId.startsWith("sloc-tab-")) {
        if (overId === "sloc-tab-__all__") return;
        const slocName = overId === "sloc-tab-__unset__" ? undefined : overId.slice(9);
        if (item.storageLocation !== slocName) {
          const prevStorageLocation = item.storageLocation;
          updateItemStorageLocation(itemId, slocName);
          const sloc = storageLocations.find((l) => l.name === slocName);
          const label = sloc ? `${sloc.emoji} ${sloc.name}` : "その他";
          showToast(`${item.name}の保管場所を${label}に設定`, "mdi:package-variant", () => {
            updateItemStorageLocation(itemId, prevStorageLocation);
          });
        }
        return;
      }

      // Item dropped on a category container - no-op (category set by dragOver)
      return;
    }

    // Dropped outside any droppable → move to unset category
    if (!over && typeof active.id === "number") {
      updateItemCategory(active.id, "");
      return;
    }

    if (!over || active.id === over.id) return;

    // Category reorder
    if (typeof active.id === "string" && typeof over.id === "string") {
      const fromName = (active.id as string).slice(4);
      const toName = (over.id as string).slice(4);
      const fromIdx = categories.findIndex((c) => c.name === fromName);
      const toIdx = categories.findIndex((c) => c.name === toName);
      if (fromIdx !== -1 && toIdx !== -1) reorderCategories(fromIdx, toIdx);
      return;
    }

    // Item reorder
    if (typeof active.id === "number" && typeof over.id === "number") {
      onItemReorder(active.id, over.id);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={(event: DragStartEvent) => {
        if (typeof event.active.id === "number") setActiveId(event.active.id);
      }}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay>
        {activeId != null && (() => {
          const item = items.find((i) => i.id === activeId);
          if (!item) return null;
          return (
            <li className="flex items-stretch bg-base-100 rounded-box shadow-lg opacity-90 select-none">
              <div className="flex flex-1 items-center gap-3 px-4 py-3 min-w-0">
                <Icon icon="mdi:check-circle-outline" className="size-5 text-base-content/30 shrink-0" />
                <div className="min-w-0">
                  <div className="truncate">{item.name}</div>
                </div>
              </div>
              <div className="flex items-center justify-center px-2">
                <Icon icon="mdi:dots-vertical" className="size-5" />
              </div>
              <div className="flex items-center justify-center pr-3 pl-2 cursor-grab">
                <Icon icon="fa6-solid:grip-lines" className="size-4 text-base-content/30" />
              </div>
            </li>
          );
        })()}
      </DragOverlay>
    </DndContext>
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

  const mainContent = (
    <main className="container mx-auto max-w-lg p-4">
      <Routes>
        <Route path="/" element={<Home locationFilter={selectedLocation} />} />
        <Route path="/out-of-stock" element={<OutOfStock storageLocationFilter={selectedStorageLocation} />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/operator" element={<OperatorInfo />} />
      </Routes>
    </main>
  );

  return (
    <GroceryProvider>
    <div className="min-h-screen bg-base-200 pb-20">
      <header className="navbar bg-base-100 shadow-sm">
        <div className="flex-none">
          <HamburgerMenu />
        </div>
        <div className="flex-1">
          <span className="text-xl font-bold">買い物リスト</span>
        </div>
      </header>
      {isListPage && (
        <div className="flex justify-end gap-1 bg-base-100 px-2 py-1 border-b border-base-300">
          <button className="btn btn-sm btn-ghost" aria-label="共有">
            <Icon icon="mdi:share-variant" className="size-5" />
          </button>
          <button className="btn btn-sm btn-ghost" aria-label="設定" onClick={() => navigate("/settings")}>
            <Icon icon="mdi:cog" className="size-5" />
          </button>
        </div>
      )}
      {isListPage ? (
        <ListDndProvider mode={isOutOfStock ? "outOfStock" : "shopping"}>
          {!isOutOfStock && <LocationTabs selected={selectedLocation} onSelect={setSelectedLocation} />}
          {isOutOfStock && <StorageLocationTabs selected={selectedStorageLocation} onSelect={setSelectedStorageLocation} />}
          {mainContent}
        </ListDndProvider>
      ) : mainContent}
      <div className="dock">
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
          <Icon icon="mdi:vanish" className="size-6" />
          <span className="dock-label">なくなった</span>
        </button>
      </div>
    </div>
    </GroceryProvider>
  );
}
