interface ConfirmModalProps {
  title: string;
  children: React.ReactNode;
  confirmLabel: string;
  /** 削除など取り消せない操作は赤いボタンにする */
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** 確認用のモーダル。左がキャンセル、右が実行ボタン */
export function ConfirmModal({ title, children, confirmLabel, danger, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="text-lg font-bold">{title}</h3>
        <div className="mt-2 text-sm leading-relaxed">{children}</div>
        <div className="modal-action">
          <button type="button" className="btn btn-sm" onClick={onCancel}>
            キャンセル
          </button>
          <button type="button" className={`btn btn-sm ${danger ? "btn-error" : "btn-primary"}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
      <button type="button" className="modal-backdrop" aria-label="キャンセル" onClick={onCancel} />
    </div>
  );
}
