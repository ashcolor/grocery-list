// slot-tools の CounterHelpDialog を参考にした使い方ダイアログ

export function HelpDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal modal-open">
      <div className="modal-box flex max-h-[calc(100dvh-2rem)] flex-col">
        <h3 className="mb-2 text-lg font-bold">使い方</h3>
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto text-sm opacity-70">
          <div>
            <div className="mb-1 font-bold">買い物のとき</div>
            <ol className="list-decimal pl-5">
              <li>「買い物」画面で、右下の＋ボタンから買うものを記入します。</li>
              <li>店で買ったら、そのアイテムをタップするとリストから消えます。</li>
            </ol>
          </div>
          <div>
            <div className="mb-1 font-bold">ものがなくなったとき</div>
            <div>「なくなった」画面で、そのアイテムをタップすると「買い物」リストへ移ります。</div>
          </div>
          <div>
            <div className="mb-1 font-bold">お店の編集</div>
            <p>選択中のお店のタブをもう一度タップすると、お店の詳細を編集できます。</p>
            <p>画像をアップロードして会員証のバーコードを登録しておくと、そのお店のリストに表示されるので便利です。</p>
          </div>
          <div>
            <div className="mb-1 font-bold">データの保存</div>
            <p>データはお使いの端末（ブラウザ）の中にだけ保存され、サーバーには送信されません。</p>
            <p>
              そのため、ほかの端末やブラウザとは同期されず、ブラウザのデータを消去すると消えてしまいます。機種変更のときなどは「設定」のエクスポートでバックアップしてください。
            </p>
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
