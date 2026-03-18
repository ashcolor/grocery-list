export default function TermsOfService() {
  return (
    <div className="flex flex-col gap-4">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-4 sm:p-6">
          <h1 className="text-xl font-bold">利用規約</h1>

          <section className="mt-6 space-y-2 text-sm leading-relaxed opacity-80">
            <h2 className="text-base font-bold opacity-100">第1条（適用）</h2>
            <p>
              本規約は、本アプリの利用に関する条件を定めるものです。利用者は本規約に同意の上、本アプリをご利用ください。
            </p>
          </section>

          <section className="mt-6 space-y-2 text-sm leading-relaxed opacity-80">
            <h2 className="text-base font-bold opacity-100">第2条（利用条件）</h2>
            <p>本アプリは無料で利用できます。</p>
            <p>利用者は、本アプリを個人的な目的で自由に利用できます。</p>
          </section>

          <section className="mt-6 space-y-2 text-sm leading-relaxed opacity-80">
            <h2 className="text-base font-bold opacity-100">第3条（データの取り扱い）</h2>
            <p>
              本アプリのデータはすべてお使いの端末のローカルストレージに保存されます。サーバーへのデータ送信は行いません。
            </p>
            <p>
              端末の変更やブラウザのデータ削除により、保存データが失われる場合があります。開発者はデータの消失について一切の責任を負いません。
            </p>
          </section>

          <section className="mt-6 space-y-2 text-sm leading-relaxed opacity-80">
            <h2 className="text-base font-bold opacity-100">第4条（免責事項）</h2>
            <p>
              本アプリの利用によって生じたあらゆる損害、不利益、トラブル、損失について、開発者は一切の責任を負いません。
            </p>
          </section>

          <section className="mt-6 space-y-2 text-sm leading-relaxed opacity-80">
            <h2 className="text-base font-bold opacity-100">第5条（規約の変更）</h2>
            <p>開発者は、必要に応じて本規約を変更できるものとします。</p>
          </section>
        </div>
      </div>
    </div>
  );
}
