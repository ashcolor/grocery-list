import { PageLayout, TextSection } from "../components/PageLayout";

export default function TermsOfService() {
  return (
    <PageLayout title="利用規約">
      <TextSection title="第1条（適用）">
        <p>
          本規約は、本アプリの利用に関する条件を定めるものです。利用者は本規約に同意の上、本アプリをご利用ください。
        </p>
      </TextSection>

      <TextSection title="第2条（利用条件）">
        <p>本アプリは無料で利用できます。</p>
        <p>利用者は、本アプリを個人的な目的で自由に利用できます。</p>
      </TextSection>

      <TextSection title="第3条（データの取り扱い）">
        <p>
          本アプリのデータはすべてお使いの端末のローカルストレージに保存されます。サーバーへのデータ送信は行いません。
        </p>
        <p>
          端末の変更やブラウザのデータ削除により、保存データが失われる場合があります。開発者はデータの消失について一切の責任を負いません。
        </p>
      </TextSection>

      <TextSection title="第4条（免責事項）">
        <p>
          本アプリの利用によって生じたあらゆる損害、不利益、トラブル、損失について、開発者は一切の責任を負いません。
        </p>
      </TextSection>

      <TextSection title="第5条（規約の変更）">
        <p>開発者は、必要に応じて本規約を変更できるものとします。</p>
      </TextSection>
    </PageLayout>
  );
}
