import type { NamedItem } from "../types";

/**
 * アイテム名に含まれるキーワードからカテゴリを自動設定するルール。
 * 上から順に判定し、最初にマッチしたものを採用する。
 * 「牛乳」が「牛」で肉になるのを防ぐため、飲み物などの紛らわしいものを先に置く。
 */
export const AUTO_CATEGORY_RULES: { category: string; keywords: string[] }[] = [
  {
    category: "飲み物",
    keywords: ["牛乳", "豆乳", "お茶", "麦茶", "紅茶", "コーヒー", "ジュース", "ミネラルウォーター", "炭酸水", "ビール", "ワイン", "酒"],
  },
  {
    category: "肉・魚",
    keywords: ["鳥", "鶏", "豚", "牛", "肉", "ひき肉", "ハム", "ベーコン", "ソーセージ", "ウインナー", "魚", "刺身", "刺し身", "鮭", "さけ", "サバ", "ぶり", "まぐろ", "えび", "いか", "たこ", "あじ", "さんま"],
  },
  {
    category: "野菜・果物",
    keywords: ["野菜", "ネギ", "白菜", "キャベツ", "レタス", "トマト", "きゅうり", "玉ねぎ", "たまねぎ", "にんじん", "人参", "じゃがいも", "さつまいも", "ピーマン", "なす", "大根", "もやし", "ほうれん草", "小松菜", "ブロッコリー", "かぼちゃ", "果物", "りんご", "みかん", "バナナ", "いちご", "ぶどう", "レモン"],
  },
  {
    category: "日用品",
    keywords: ["ティッシュ", "トイレットペーパー", "洗剤", "シャンプー", "リンス", "ボディソープ", "石鹸", "せっけん", "ゴミ袋", "ラップ", "アルミホイル", "歯磨き", "歯ブラシ", "マスク", "電池", "スポンジ"],
  },
];

/** カタカナをひらがなにして、表記ゆれを吸収する */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

/**
 * アイテム名からカテゴリ名を推定する。
 * ユーザーが持っているカテゴリに存在するものだけを返す。マッチしなければ空文字。
 */
export function guessCategory(name: string, categories: NamedItem[]): string {
  const target = normalize(name);
  for (const rule of AUTO_CATEGORY_RULES) {
    if (!categories.some((c) => c.name === rule.category)) continue;
    if (rule.keywords.some((kw) => target.includes(normalize(kw)))) {
      return rule.category;
    }
  }
  return "";
}
