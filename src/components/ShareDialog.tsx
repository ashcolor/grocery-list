import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { renderTextImage } from "../utils/renderTextImage";

// slot-tools の CounterShareDialog を参考にした共有ダイアログ

type CopyActionKey = "url" | "text" | "image";

const COPIED_MESSAGES: Record<CopyActionKey, string> = {
  url: "URLをコピーしました",
  text: "テキストをコピーしました",
  image: "画像をコピーしました",
};

const FEEDBACK_DURATION = 1400;

interface ShareDialogProps {
  title: string;
  shareText: string;
  /** 省略時は URL 欄を出さない（メモなど） */
  shareUrl?: string;
  /** 画像ダウンロード時のファイル名（拡張子なし） */
  fileName: string;
  onClose: () => void;
}

export function ShareDialog({ title, shareText, shareUrl, fileName, onClose }: ShareDialogProps) {
  const [copiedKey, setCopiedKey] = useState<CopyActionKey | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  /** 処理を実行し、成功したらボタンのアイコンとトーストで知らせる */
  const runCopyAction = async (action: () => Promise<void>, key?: CopyActionKey) => {
    try {
      await action();
      if (key === undefined) return;
      setCopiedKey(key);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        setCopiedKey(null);
        timerRef.current = null;
      }, FEEDBACK_DURATION);
    } catch (error) {
      // 共有シートを閉じただけのときは何もしない
      if (error instanceof DOMException && error.name === "AbortError") return;
      window.alert(error instanceof Error && error.message ? error.message : "処理に失敗しました。");
    }
  };

  const copyIcon = (key: CopyActionKey) => (copiedKey === key ? "mdi:check" : "mdi:content-copy");

  const writeText = async (text: string) => {
    if (typeof navigator.clipboard?.writeText !== "function") {
      throw new Error("このブラウザではクリップボードへのコピーに対応していません。");
    }
    await navigator.clipboard.writeText(text);
  };

  const copyImage = async () => {
    if (typeof navigator.clipboard?.write !== "function" || typeof ClipboardItem === "undefined") {
      throw new Error("このブラウザでは画像コピーに対応していません。");
    }
    // Safari はユーザー操作の直後にしか書き込めないため、Promise のまま渡す
    await navigator.clipboard.write([new ClipboardItem({ "image/png": renderTextImage(shareText) })]);
  };

  const downloadImage = async () => {
    const blob = await renderTextImage(shareText);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const shareWithApps = async () => {
    await navigator.share({ title, text: shareText });
  };

  const canShareWithApps = typeof navigator.share === "function";

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="mb-4 text-lg font-bold">共有</h3>

        {shareUrl && (
          <section className="mb-4 flex flex-col gap-2">
            <p className="inline-flex items-center gap-1 text-xs font-semibold tracking-wide opacity-70">
              <Icon icon="mdi:link-variant" className="size-3.5" />
              <span>URL</span>
            </p>
            <button
              type="button"
              className="btn btn-primary btn-soft justify-start"
              onClick={() => void runCopyAction(() => writeText(shareUrl), "url")}
            >
              <Icon icon={copyIcon("url")} className="size-4" />
              <span>リストのURLをコピー</span>
            </button>
          </section>
        )}

        <section className="flex flex-col gap-2">
          <p className="inline-flex items-center gap-1 text-xs font-semibold tracking-wide opacity-70">
            <Icon icon="mdi:file-document-outline" className="size-3.5" />
            <span>テキスト</span>
          </p>
          <textarea
            className="textarea textarea-bordered h-40 w-full resize-none text-xs leading-relaxed"
            value={shareText}
            readOnly
            onFocus={(e) => e.currentTarget.select()}
          />
          <button
            type="button"
            className="btn btn-primary btn-soft justify-start"
            onClick={() => void runCopyAction(() => writeText(shareText), "text")}
          >
            <Icon icon={copyIcon("text")} className="size-4" />
            <span>テキストコピー</span>
          </button>
          <button
            type="button"
            className="btn btn-primary btn-soft justify-start"
            onClick={() => void runCopyAction(copyImage, "image")}
          >
            <Icon icon={copyIcon("image")} className="size-4" />
            <span>画像コピー</span>
          </button>
          <button
            type="button"
            className="btn btn-primary btn-soft justify-start"
            onClick={() => void runCopyAction(downloadImage)}
          >
            <Icon icon="mdi:download" className="size-4" />
            <span>画像ダウンロード</span>
          </button>
          {canShareWithApps && (
            <button
              type="button"
              className="btn btn-primary btn-soft justify-start"
              onClick={() => void runCopyAction(shareWithApps)}
            >
              <Icon icon="mdi:share-variant-outline" className="size-4" />
              <span>ほかのアプリで共有</span>
            </button>
          )}
        </section>

        <div className="modal-action">
          <button type="button" className="btn btn-sm" onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>

      {copiedKey && (
        <div className="toast toast-center toast-top z-10">
          <div role="status" className="alert alert-success alert-soft">
            <Icon icon="mdi:check" className="size-4" />
            <span>{COPIED_MESSAGES[copiedKey]}</span>
          </div>
        </div>
      )}
      <button type="button" className="modal-backdrop" aria-label="共有を閉じる" onClick={onClose} />
    </div>
  );
}
