import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useGrocery } from "../context/GroceryContext";
import { exportBackup, importBackup } from "../utils/backup";
import { ConfirmModal } from "../components/ConfirmModal";
import { PageLayout, PageSection } from "../components/PageLayout";

export default function Settings() {
  const { resetToDefaults, clearAll } = useGrocery();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirming, setConfirming] = useState<"reset" | "clear" | null>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!window.confirm("今のデータはすべて上書きされます。インポートしますか？")) return;
    try {
      await importBackup(file);
      window.location.reload();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "インポートに失敗しました");
    }
  };

  return (
    <PageLayout title="設定">
      <PageSection title="インポート・エクスポート">
      <p className="text-sm text-base-content/60">
        リスト・マスター・メモをファイルに保存したり、保存したファイルから戻したりできます。
      </p>
      <div className="flex gap-2">
        <button className="btn btn-outline btn-sm" onClick={exportBackup}>
          <Icon icon="mdi:export" className="size-4" />
          エクスポート
        </button>
        <button className="btn btn-outline btn-sm" onClick={() => fileInputRef.current?.click()}>
          <Icon icon="mdi:import" className="size-4" />
          インポート
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleImport}
        />
      </div>
      </PageSection>

      <PageSection title="データ管理">
      <p className="text-sm text-base-content/60">
        データを最初の状態に戻したり、すべて消したりできます。メモは残ります。
      </p>
      <div className="flex gap-2">
        <button
          className="btn btn-outline btn-sm"
          onClick={() => setConfirming("reset")}
        >
          <Icon icon="mdi:restart" className="size-4" />
          初期化
        </button>
        <button
          className="btn btn-outline btn-sm btn-error"
          onClick={() => setConfirming("clear")}
        >
          <Icon icon="mdi:delete-forever" className="size-4" />
          全削除
        </button>
      </div>
      </PageSection>

      {confirming === "reset" && (
        <ConfirmModal
          title="初期化の確認"
          confirmLabel="初期化"
          danger
          onConfirm={() => {
            resetToDefaults();
            setConfirming(null);
          }}
          onCancel={() => setConfirming(null)}
        >
          すべてのデータを初期状態に戻しますか？
          <br />
          <span className="text-base-content/60">
            リストと、店・カテゴリ・保管場所が最初の状態に戻ります。メモは残ります。
          </span>
        </ConfirmModal>
      )}
      {confirming === "clear" && (
        <ConfirmModal
          title="全削除の確認"
          confirmLabel="全削除"
          danger
          onConfirm={() => {
            clearAll();
            setConfirming(null);
          }}
          onCancel={() => setConfirming(null)}
        >
          すべてのデータを削除しますか？この操作は元に戻せません。
          <br />
          <span className="text-base-content/60">
            リストと、店・カテゴリ・保管場所がすべて空になります。メモは残ります。
          </span>
        </ConfirmModal>
      )}
    </PageLayout>
  );
}
