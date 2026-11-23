import { useLocation, useNavigate } from "react-router";
import { Icon } from "@iconify/react";

/**
 * リスト・メモ以外の画面（設定・マスター・規約など）の共通レイアウト。
 * 戻るボタン付きの見出しと、上下の余白・ブロック間の間隔をそろえる
 */
export function PageLayout({ title, children }: { title: string; children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  // 直接開いたなど戻る先の履歴がないときは、買い物リストへ移動する
  const goBack = () => {
    if (location.key === "default") navigate("/");
    else navigate(-1);
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex items-center gap-1">
        {/* ボタン内の余白の分だけ左にずらし、アイコンを本文の左端に揃える */}
        <button className="btn btn-ghost btn-sm btn-square -ml-1.5" aria-label="戻る" onClick={goBack}>
          <Icon icon="mdi:arrow-left" className="size-6" />
        </button>
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      {children}
    </div>
  );
}

/** PageLayout 内の見出し付きのまとまり */
export function PageSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

/** 規約などの文章のまとまり */
export function TextSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2 text-sm leading-relaxed text-base-content/80">
      <h2 className="text-base font-bold text-base-content">{title}</h2>
      {children}
    </section>
  );
}
