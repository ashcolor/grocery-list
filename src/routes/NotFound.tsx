import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="flex flex-col gap-4">
      <div className="card card-border bg-base-100">
        <div className="card-body items-center p-4 text-center sm:p-6">
          <h1 className="text-xl font-bold">ページが見つかりません</h1>
          <p className="text-sm opacity-70">お探しのページは移動または削除された可能性があります。</p>
          <Link to="/" className="btn btn-primary btn-sm mt-2">
            買い物リストへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
