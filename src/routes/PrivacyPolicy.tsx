import { PageLayout, TextSection } from "../components/PageLayout";

export default function PrivacyPolicy() {
  return (
    <PageLayout title="プライバシーポリシー・免責事項">
      <TextSection title="プライバシーポリシー">
        <h3 className="font-bold text-base-content">個人情報の利用目的</h3>
        <p>本アプリでは、個人を特定できる情報を収集しません。</p>

        <h3 className="mt-2 font-bold text-base-content">データの保存について</h3>
        <p>
          本アプリのデータはすべてお使いの端末のローカルストレージに保存されます。サーバーへのデータ送信は行いません。
        </p>
      </TextSection>

      <TextSection title="免責事項">
        <h3 className="font-bold text-base-content">内容の正確性について</h3>
        <p>
          本アプリに掲載される情報はできる限り正確かつ信頼性のあるものを提供するよう努めていますが、その内容の正確性や完全性について保証するものではありません。
        </p>

        <h3 className="mt-2 font-bold text-base-content">免責事項の範囲</h3>
        <p>
          本アプリの利用によって生じたあらゆる損害、不利益、トラブル、損失について、開発者は一切の責任を負いません。
        </p>
      </TextSection>
    </PageLayout>
  );
}
