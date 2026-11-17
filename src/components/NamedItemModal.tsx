import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import type { NamedItem } from "../types";
import { resizeImageToDataUrl } from "../utils/resizeImage";
import { ConfirmModal } from "./ConfirmModal";

interface NamedItemModalProps {
  title: string;
  /** 編集時は元の値。追加時は undefined */
  initial?: NamedItem;
  emojiPlaceholder: string;
  namePlaceholder: string;
  /** 画像（会員カードなど）の設定欄を出す */
  withImage?: boolean;
  /** 保存。エラーメッセージを返すと反映せずに表示する。編集時は変更のたびに呼ばれる */
  onSave: (item: NamedItem) => string | null;
  /** 編集時のみ。モーダル内の削除ボタンから呼ばれる */
  onDelete?: () => void;
  onClose: () => void;
}

/** マスター（店・カテゴリ・保管場所）の追加・編集モーダル */
export function NamedItemModal({
  title,
  initial,
  emojiPlaceholder,
  namePlaceholder,
  withImage,
  onSave,
  onDelete,
  onClose,
}: NamedItemModalProps) {
  const [emoji, setEmoji] = useState(initial?.emoji ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [image, setImage] = useState<string | undefined>(initial?.image);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      change({ image: await resizeImageToDataUrl(file) });
    } catch {
      setError("画像を読み込めませんでした");
    }
  };

  // 編集時は変更をその場で反映する。追加時は「追加」ボタンで確定する
  const isEdit = initial !== undefined;

  /** 入力を検証して保存する。成功したら true */
  const commit = (next: { emoji: string; name: string; image?: string }): boolean => {
    const trimmedName = next.name.trim();
    const trimmedEmoji = next.emoji.trim();
    if (!trimmedEmoji || !trimmedName) {
      setError("絵文字と名前を入力してください");
      return false;
    }
    const item: NamedItem = withImage
      ? { name: trimmedName, emoji: trimmedEmoji, image: next.image }
      : { name: trimmedName, emoji: trimmedEmoji };
    const err = onSave(item);
    setError(err);
    return err === null;
  };

  const change = (patch: Partial<{ emoji: string; name: string; image: string | undefined }>) => {
    const next = { emoji, name, image, ...patch };
    setEmoji(next.emoji);
    setName(next.name);
    setImage(next.image);
    if (isEdit) {
      commit(next);
    } else {
      setError(null);
    }
  };

  const handleAdd = () => {
    if (commit({ emoji, name, image })) onClose();
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="text-lg font-bold">{title}</h3>

        <div className="mt-4 flex items-center gap-2">
          <input
            type="text"
            className="input w-16 text-center"
            value={emoji}
            onChange={(e) => change({ emoji: e.target.value })}
            placeholder={emojiPlaceholder}
            aria-label="絵文字"
          />
          <input
            type="text"
            className="input flex-1"
            value={name}
            onChange={(e) => change({ name: e.target.value })}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              if (isEdit) onClose();
              else handleAdd();
            }}
            placeholder={namePlaceholder}
            aria-label="名前"
          />
        </div>

        {withImage && (
          <div className="mt-4 flex flex-col gap-2">
            <span className="text-sm text-base-content/60">会員カードなどの画像</span>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            {image && <img src={image} alt="" className="max-h-28 self-center rounded bg-white object-contain" />}
            <div className="flex gap-2">
              <button type="button" className="btn btn-sm btn-outline flex-1" onClick={() => fileInputRef.current?.click()}>
                <Icon icon="mdi:image-plus" className="size-4" />
                {image ? "画像を変更" : "画像を設定"}
              </button>
              {image && (
                <button type="button" className="btn btn-sm btn-ghost text-error" onClick={() => change({ image: undefined })}>
                  画像を削除
                </button>
              )}
            </div>
          </div>
        )}

        {error && <p className="mt-3 text-sm text-error">{error}</p>}

        <div className="modal-action">
          {isEdit ? (
            <>
              {onDelete && (
                <button
                  type="button"
                  className="btn btn-sm btn-ghost text-error mr-auto"
                  onClick={() => setConfirmingDelete(true)}
                >
                  <Icon icon="mdi:delete" className="size-4" />
                  削除
                </button>
              )}
              <button type="button" className="btn btn-sm" onClick={onClose}>
                閉じる
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-sm" onClick={onClose}>
                キャンセル
              </button>
              <button type="button" className="btn btn-sm btn-primary" onClick={handleAdd}>
                追加
              </button>
            </>
          )}
        </div>
      </div>
      <button type="button" className="modal-backdrop" aria-label="閉じる" onClick={onClose} />

      {confirmingDelete && isEdit && onDelete && (
        <ConfirmModal
          title="削除の確認"
          confirmLabel="削除"
          danger
          onConfirm={() => {
            onDelete();
            onClose();
          }}
          onCancel={() => setConfirmingDelete(false)}
        >
          「{initial.name}」を削除しますか？
          <br />
          <span className="text-base-content/60">使っているアイテムは「その他」になります。</span>
        </ConfirmModal>
      )}
    </div>
  );
}
