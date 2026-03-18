import { useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router";
import { Icon } from "@iconify/react";
import { GroceryProvider, useGrocery } from "./context/GroceryContext";
import Home from "./routes/Home";
import OutOfStock from "./routes/OutOfStock";
import Settings from "./routes/Settings";

function LocationTabs({ selected, onSelect }: { selected: string | null; onSelect: (loc: string | null) => void }) {
  const { locations } = useGrocery();
  if (locations.length === 0) return null;
  return (
    <div role="tablist" className="tabs tabs-border bg-base-100 overflow-x-auto">
      <a
        role="tab"
        className={`tab ${selected === null ? "tab-active" : ""}`}
        onClick={() => onSelect(null)}
      >
        すべて
      </a>
      {locations.map((loc) => (
        <a
          key={loc}
          role="tab"
          className={`tab ${selected === loc ? "tab-active" : ""}`}
          onClick={() => onSelect(loc)}
        >
          {loc}
        </a>
      ))}
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const showTabs = location.pathname === "/" || location.pathname === "/out-of-stock";

  return (
    <GroceryProvider>
    <div className="min-h-screen bg-base-200 pb-20">
      <header className="navbar bg-base-100 shadow-sm">
        <div className="flex-1">
          <span className="text-xl font-bold px-4">買い物リスト</span>
        </div>
        <div className="flex-none">
          <button className="btn btn-ghost btn-square" onClick={() => navigate("/settings")}>
            <Icon icon="mdi:cog" className="size-6" />
          </button>
        </div>
      </header>
      {showTabs && <LocationTabs selected={selectedLocation} onSelect={setSelectedLocation} />}
      <main className="container mx-auto max-w-lg p-4">
        <Routes>
          <Route path="/" element={<Home locationFilter={selectedLocation} />} />
          <Route path="/out-of-stock" element={<OutOfStock locationFilter={selectedLocation} />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
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
