import { Icon } from "@iconify/react";

// slot-tools の CounterHelpDialog を参考にした使い方ダイアログ

function HelpItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs opacity-60">
      <Icon icon={icon} className="size-4 shrink-0" aria-hidden />
      <span>{text}</span>
    </div>
  );
}

export function HelpDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal modal-open">
      <div className="modal-box flex max-h-[calc(100dvh-2rem)] flex-col">
        <h3 className="mb-2 text-lg font-bold">使い方</h3>
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto text-sm opacity-70">
          <div>
            <div className="mb-1 font-bold">リストの流れ</div>
            <div>
              「なくなった」に切れたものを登録しておき、タップすると「買い物」へ移動します。買ったら「買い物」でタップすると「なくなった」へ戻ります。
            </div>
          </div>
          <div>
            <div className="mb-1 font-bold">アイテムの操作</div>
            <div className="flex flex-col gap-1">
              <HelpItem icon="mdi:plus" text="追加: 右下のボタン、またはカテゴリ見出しの＋から追加" />
              <HelpItem icon="mdi:check-circle-outline" text="タップ: もう一方のリストへ移動" />
              <HelpItem icon="mdi:dots-vertical" text="メニュー: 名前・カテゴリ・店・保管場所の変更や削除" />
              <HelpItem icon="mdi:drag-horizontal-variant" text="ドラッグ: 並べ替えやカテゴリの移動" />
            </div>
          </div>
          <div>
            <div className="mb-1 font-bold">タブ</div>
            <div>
              「買い物」は店ごと、「なくなった」は保管場所ごとに絞り込めます。リストを左右にスワイプしてもタブを切り替えられます。選択中のタブをもう一度タップすると、その店・保管場所の名前などを編集できます。アイテムをタブへドラッグすると、店や保管場所を設定できます。
            </div>
          </div>
          <div>
            <div className="mb-1 font-bold">ツールバー</div>
            <div className="flex flex-col gap-1">
              <HelpItem icon="mdi:information-outline" text="使い方: この説明の表示" />
              <HelpItem icon="mdi:share-variant" text="共有: URL・テキスト・画像でリストを共有" />
            </div>
          </div>
          <div>
            <div className="mb-1 font-bold">マスター・設定</div>
            <div>左上のメニューから、店・カテゴリ・保管場所の編集や、データのバックアップができます。</div>
          </div>
        </div>
        <div className="modal-action">
          <button type="button" className="btn btn-sm" onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>
      <button type="button" className="modal-backdrop" aria-label="使い方を閉じる" onClick={onClose} />
    </div>
  );
}
