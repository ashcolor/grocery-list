import { Routes, Route, useLocation, useNavigate } from "react-router";
import { Icon } from "@iconify/react";
import { GroceryProvider } from "./context/GroceryContext";
import Home from "./routes/Home";
import OutOfStock from "./routes/OutOfStock";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <GroceryProvider>
    <div className="min-h-screen bg-base-200 pb-20">
      <header className="navbar bg-base-100 shadow-sm">
        <div className="flex-1">
          <span className="text-xl font-bold px-4">買い物リスト</span>
        </div>
      </header>
      <main className="container mx-auto max-w-lg p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/out-of-stock" element={<OutOfStock />} />
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
