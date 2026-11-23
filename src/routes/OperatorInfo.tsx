import { PageLayout, TextSection } from "../components/PageLayout";

function XLink() {
  return (
    <p>
      X (Twitter):{" "}
      <a href="https://x.com/ashcolor06" target="_blank" rel="noopener noreferrer" className="link link-primary">
        @ashcolor06
      </a>
    </p>
  );
}

export default function OperatorInfo() {
  return (
    <PageLayout title="運営者情報">
      <TextSection title="運営者">
        <p>運営者名: あっしゅからー</p>
        <XLink />
      </TextSection>

      <TextSection title="お問い合わせ">
        <p>ご意見・不具合報告は、下記のXアカウントへご連絡ください。</p>
        <XLink />
      </TextSection>
    </PageLayout>
  );
}
