import { useEffect } from "react";
import { useLocation } from "react-router";

const SITE_URL = "https://grocely-list.ashcolor.jp";
const SITE_NAME = "買い物リスト";

type PageMeta = {
  /** 省略時はトップと同じタイトル（index.html の初期値） */
  title?: string;
  /** 検索結果に出さないページ */
  noindex?: boolean;
};

/** 検索に出したいのはトップと規約系ページだけ。アプリの操作画面は noindex にする */
const PAGE_META: Record<string, PageMeta> = {
  "/": {},
  "/out-of-stock": { title: "なくなったもの", noindex: true },
  "/memo": { title: "メモ", noindex: true },
  "/settings": { title: "設定", noindex: true },
  "/master/locations": { title: "店", noindex: true },
  "/master/categories": { title: "カテゴリ", noindex: true },
  "/master/storage-locations": { title: "保管場所", noindex: true },
  "/privacy": { title: "プライバシーポリシー・免責事項" },
  "/terms": { title: "利用規約" },
  "/operator": { title: "運営者情報" },
};

const NOT_FOUND_META: PageMeta = { title: "ページが見つかりません", noindex: true };

/** index.html の初期タイトル。トップに戻ったときに元へ戻すため、最初に読み込んだ値を覚えておく */
const defaultTitle = document.title;

function upsertHeadTag<K extends "meta" | "link">(tag: K, selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLElementTagNameMap[K]>(selector);
  if (!el) {
    el = document.createElement(tag);
    document.head.appendChild(el);
  }
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
}

/** 表示中のページに合わせて title・canonical・robots を書き換える */
export function usePageMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = PAGE_META[pathname] ?? NOT_FOUND_META;
    document.title = meta.title ? `${meta.title}｜${SITE_NAME}` : defaultTitle;
    upsertHeadTag("link", 'link[rel="canonical"]', { rel: "canonical", href: `${SITE_URL}${pathname}` });

    const robots = document.head.querySelector('meta[name="robots"]');
    if (meta.noindex) {
      upsertHeadTag("meta", 'meta[name="robots"]', { name: "robots", content: "noindex" });
    } else {
      robots?.remove();
    }
  }, [pathname]);
}

/** ページ内に見出しがない画面。ここではヘッダーのアプリ名を h1 にする（他の画面はページ側の h1 と重複させない） */
const PAGES_WITHOUT_HEADING = ["/", "/out-of-stock", "/memo"];

export function isHeaderHeadingPage(pathname: string) {
  return PAGES_WITHOUT_HEADING.includes(pathname);
}
