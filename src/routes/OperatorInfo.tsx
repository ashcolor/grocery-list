export default function OperatorInfo() {
  return (
    <div className="flex flex-col gap-4">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-4 sm:p-6">
          <h1 className="text-xl font-bold">運営者情報</h1>

          <div className="mt-3 space-y-2 text-sm leading-relaxed opacity-80">
            <p>運営者名: あっしゅからー</p>
            <p>
              X (Twitter):{" "}
              <a
                href="https://x.com/ashcolor06"
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary"
              >
                @ashcolor06
              </a>
            </p>
          </div>

          <div className="mt-6 space-y-2 text-sm leading-relaxed opacity-80">
            <h2 className="text-base font-bold opacity-100">お問い合わせ</h2>
            <p>ご意見・不具合報告は、下記のXアカウントへご連絡ください。</p>
            <p>
              X (Twitter):{" "}
              <a
                href="https://x.com/ashcolor06"
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary"
              >
                @ashcolor06
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
