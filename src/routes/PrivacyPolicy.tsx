export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col gap-4">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-4 sm:p-6">
          <h1 className="text-xl font-bold">プライバシーポリシー・免責事項</h1>

          <section className="mt-6 space-y-2 text-sm leading-relaxed opacity-80">
            <h2 className="text-base font-bold opacity-100">プライバシーポリシー</h2>

            <h3 className="font-bold opacity-100">個人情報の利用目的</h3>
            <p>本アプリでは、個人を特定できる情報を収集しません。</p>

            <h3 className="font-bold opacity-100">データの保存について</h3>
            <p>
              本アプリのデータはすべてお使いの端末のローカルストレージに保存されます。サーバーへのデータ送信は行いません。
            </p>
          </section>

          <section className="mt-6 space-y-2 text-sm leading-relaxed opacity-80">
            <h2 className="text-base font-bold opacity-100">免責事項</h2>

            <h3 className="font-bold opacity-100">内容の正確性について</h3>
            <p>
              本アプリに掲載される情報はできる限り正確かつ信頼性のあるものを提供するよう努めていますが、その内容の正確性や完全性について保証するものではありません。
            </p>

            <h3 className="font-bold opacity-100">免責事項の範囲</h3>
            <p>
              本アプリの利用によって生じたあらゆる損害、不利益、トラブル、損失について、開発者は一切の責任を負いません。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
