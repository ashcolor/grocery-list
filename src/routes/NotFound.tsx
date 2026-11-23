import { Link } from "react-router";
import { PageLayout } from "../components/PageLayout";

export default function NotFound() {
  return (
    <PageLayout title="ページが見つかりません">
      <div className="flex flex-col items-start gap-4">
        <p className="text-sm text-base-content/60">お探しのページは移動または削除された可能性があります。</p>
        <Link to="/" className="btn btn-primary btn-sm">
          買い物リストへ戻る
        </Link>
      </div>
    </PageLayout>
  );
}
