import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Icon } from "@iconify/react";
import { usePwaInstallPrompt } from "../utils/usePwaInstallPrompt";
import { IosInstallGuideModal } from "./IosInstallGuideModal";

function isMobileDevice() {
  return (
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    window.matchMedia("(max-width: 768px)").matches
  );
}

function isIosBrowser() {
  const ua = navigator.userAgent;
  const isIosDevice = /iPhone|iPad|iPod/i.test(ua);
  const isIpadOsDesktopMode = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

  return isIosDevice || isIpadOsDesktopMode;
}

export function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === "dark");
  const [isMobile, setIsMobile] = useState(() => isMobileDevice());
  const [isIos, setIsIos] = useState(() => isIosBrowser());
  const [showIosInstallHelp, setShowIosInstallHelp] = useState(false);
  const { canInstall, isInstalled, promptInstall } = usePwaInstallPrompt();
  const location = useLocation();
  const installLabel = isMobile ? "ホーム画面に追加" : "アプリをインストール";
  const isInstallActionAvailable = canInstall || isIos;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const updateDeviceState = () => {
      setIsMobile(isMobileDevice());
      setIsIos(isIosBrowser());
    };

    updateDeviceState();
    mediaQuery.addEventListener("change", updateDeviceState);

    return () => {
      mediaQuery.removeEventListener("change", updateDeviceState);
    };
  }, []);

  const installApp = async () => {
    if (!canInstall) {
      if (isIos) {
        setShowIosInstallHelp(true);
      }
      return;
    }

    await promptInstall();
    setShowIosInstallHelp(false);
    setOpen(false);
  };

  const toggleTheme = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
    setDark(!dark);
  };

  const menuItems = [
    { path: "/", label: "お買いもの", icon: "mdi:cart-outline" },
    { path: "/out-of-stock", label: "なくなった", icon: "mdi:cube-outline" },
    { path: "/memo", label: "メモ", icon: "mdi:note-outline" },
    { path: "/settings", label: "設定", icon: "mdi:cog-outline" },
  ];

  return (
    <>
      <button
        type="button"
        className="btn btn-square btn-ghost"
        onClick={() => setOpen(!open)}
        aria-label="メニュー"
      >
            <Icon icon="fa6-solid:bars" className="size-4" />
      </button>

      {open && <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setOpen(false)} />}

      <div
        className={`bg-base-100 fixed top-0 left-0 z-50 flex h-full w-64 flex-col shadow-xl transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="border-base-300 flex items-center gap-2 border-b px-4 py-3">
          <img src="/logo.png" alt="買い物リスト" className="size-8" />
          <span className="text-lg font-bold">買い物リスト</span>
          <button
            type="button"
            className="btn btn-square btn-ghost btn-sm ml-auto"
            onClick={toggleTheme}
            aria-label="テーマ切替"
          >
            {dark ? (
              <Icon icon="bi:moon" className="size-5" />
            ) : (
              <Icon icon="bi:sun" className="size-5" />
            )}
          </button>
        </div>

        <div>
          <ul className="menu bg-base-100 w-full">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-4 py-4 ${location.pathname === item.path ? "bg-base-300/30" : ""}`}
                >
                  <Icon icon={item.icon} className="size-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto">
          {!isInstalled && (
            <div className="p-4">
              <button
                type="button"
                onClick={installApp}
                disabled={!isInstallActionAvailable}
                className="btn btn-primary w-full"
              >
                <Icon icon="mdi:download" className="size-4" />
                <span>{installLabel}</span>
              </button>
            </div>
          )}

          <div className="border-base-300 border-t" />
          <div className="p-4 text-xs">
            <div className="flex flex-col gap-1">
              <Link to="/operator" onClick={() => setOpen(false)} className="link link-hover">
                運営者情報
              </Link>
              <Link to="/terms" onClick={() => setOpen(false)} className="link link-hover">
                利用規約
              </Link>
              <Link to="/privacy" onClick={() => setOpen(false)} className="link link-hover">
                プライバシーポリシー
              </Link>
            </div>
          </div>
        </div>
      </div>

      <IosInstallGuideModal
        open={showIosInstallHelp}
        onClose={() => setShowIosInstallHelp(false)}
      />
    </>
  );
}
