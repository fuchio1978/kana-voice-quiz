export type KanaEntry = {
  kana: string;
  sound: string;
  word: string;
  emoji: string;
  row: string;
  column: string;
};

export type PracticeScope = {
  id: string;
  label: string;
  kana: string[];
};

export const kanaList: KanaEntry[] = [
  { kana: "あ", sound: "あ", word: "あめ", emoji: "🍬", row: "あ行", column: "あ段" },
  { kana: "い", sound: "い", word: "いぬ", emoji: "🐶", row: "あ行", column: "い段" },
  { kana: "う", sound: "う", word: "うさぎ", emoji: "🐰", row: "あ行", column: "う段" },
  { kana: "え", sound: "え", word: "えんぴつ", emoji: "✏️", row: "あ行", column: "え段" },
  { kana: "お", sound: "お", word: "おにぎり", emoji: "🍙", row: "あ行", column: "お段" },
  { kana: "か", sound: "か", word: "かさ", emoji: "☂️", row: "か行", column: "あ段" },
  { kana: "き", sound: "き", word: "きつね", emoji: "🦊", row: "か行", column: "い段" },
  { kana: "く", sound: "く", word: "くるま", emoji: "🚗", row: "か行", column: "う段" },
  { kana: "け", sound: "け", word: "けいと", emoji: "🧶", row: "か行", column: "え段" },
  { kana: "こ", sound: "こ", word: "こあら", emoji: "🐨", row: "か行", column: "お段" },
  { kana: "さ", sound: "さ", word: "さかな", emoji: "🐟", row: "さ行", column: "あ段" },
  { kana: "し", sound: "し", word: "しか", emoji: "🦌", row: "さ行", column: "い段" },
  { kana: "す", sound: "す", word: "すいか", emoji: "🍉", row: "さ行", column: "う段" },
  { kana: "せ", sound: "せ", word: "せみ", emoji: "🪲", row: "さ行", column: "え段" },
  { kana: "そ", sound: "そ", word: "そら", emoji: "☁️", row: "さ行", column: "お段" },
  { kana: "た", sound: "た", word: "たいこ", emoji: "🥁", row: "た行", column: "あ段" },
  { kana: "ち", sound: "ち", word: "ちず", emoji: "🗺️", row: "た行", column: "い段" },
  { kana: "つ", sound: "つ", word: "つき", emoji: "🌙", row: "た行", column: "う段" },
  { kana: "て", sound: "て", word: "てがみ", emoji: "💌", row: "た行", column: "え段" },
  { kana: "と", sound: "と", word: "とけい", emoji: "🕒", row: "た行", column: "お段" },
  { kana: "な", sound: "な", word: "なし", emoji: "🍐", row: "な行", column: "あ段" },
  { kana: "に", sound: "に", word: "にじ", emoji: "🌈", row: "な行", column: "い段" },
  { kana: "ぬ", sound: "ぬ", word: "ぬの", emoji: "🧣", row: "な行", column: "う段" },
  { kana: "ね", sound: "ね", word: "ねこ", emoji: "🐱", row: "な行", column: "え段" },
  { kana: "の", sound: "の", word: "のり", emoji: "🍙", row: "な行", column: "お段" },
  { kana: "は", sound: "は", word: "はな", emoji: "🌸", row: "は行", column: "あ段" },
  { kana: "ひ", sound: "ひ", word: "ひこうき", emoji: "✈️", row: "は行", column: "い段" },
  { kana: "ふ", sound: "ふ", word: "ふね", emoji: "⛵", row: "は行", column: "う段" },
  { kana: "へ", sound: "へ", word: "へび", emoji: "🐍", row: "は行", column: "え段" },
  { kana: "ほ", sound: "ほ", word: "ほし", emoji: "⭐", row: "は行", column: "お段" },
  { kana: "ま", sound: "ま", word: "まど", emoji: "🪟", row: "ま行", column: "あ段" },
  { kana: "み", sound: "み", word: "みかん", emoji: "🍊", row: "ま行", column: "い段" },
  { kana: "む", sound: "む", word: "むし", emoji: "🐞", row: "ま行", column: "う段" },
  { kana: "め", sound: "め", word: "めがね", emoji: "👓", row: "ま行", column: "え段" },
  { kana: "も", sound: "も", word: "もも", emoji: "🍑", row: "ま行", column: "お段" },
  { kana: "や", sound: "や", word: "やま", emoji: "⛰️", row: "や行", column: "あ段" },
  { kana: "ゆ", sound: "ゆ", word: "ゆき", emoji: "❄️", row: "や行", column: "う段" },
  { kana: "よ", sound: "よ", word: "よる", emoji: "🌃", row: "や行", column: "お段" },
  { kana: "ら", sound: "ら", word: "らいおん", emoji: "🦁", row: "ら行", column: "あ段" },
  { kana: "り", sound: "り", word: "りす", emoji: "🐿️", row: "ら行", column: "い段" },
  { kana: "る", sound: "る", word: "るすばん", emoji: "🏠", row: "ら行", column: "う段" },
  { kana: "れ", sound: "れ", word: "れもん", emoji: "🍋", row: "ら行", column: "え段" },
  { kana: "ろ", sound: "ろ", word: "ろうそく", emoji: "🕯️", row: "ら行", column: "お段" },
  { kana: "わ", sound: "わ", word: "わに", emoji: "🐊", row: "わ行", column: "あ段" },
  { kana: "を", sound: "を", word: "ほんを よむ", emoji: "📖", row: "わ行", column: "え段" },
  { kana: "ん", sound: "ん", word: "んーと かんがえる", emoji: "🤔", row: "わ行", column: "お段" }
];

export const gojyuonRows: Array<{ row: string; kana: string[] }> = [
  { row: "あ行", kana: ["あ", "い", "う", "え", "お"] },
  { row: "か行", kana: ["か", "き", "く", "け", "こ"] },
  { row: "さ行", kana: ["さ", "し", "す", "せ", "そ"] },
  { row: "た行", kana: ["た", "ち", "つ", "て", "と"] },
  { row: "な行", kana: ["な", "に", "ぬ", "ね", "の"] },
  { row: "は行", kana: ["は", "ひ", "ふ", "へ", "ほ"] },
  { row: "ま行", kana: ["ま", "み", "む", "め", "も"] },
  { row: "や行", kana: ["や", "", "ゆ", "", "よ"] },
  { row: "ら行", kana: ["ら", "り", "る", "れ", "ろ"] },
  { row: "わ行", kana: ["わ", "", "", "を", "ん"] }
];

export const rowScopes: PracticeScope[] = gojyuonRows.map((row) => ({
  id: row.row,
  label: row.row,
  kana: row.kana.filter(Boolean),
}));

export const columnScopes: PracticeScope[] = [
  { id: "a-top", label: "あかさたな", kana: ["あ", "か", "さ", "た", "な"] },
  { id: "a-bottom", label: "はまやらわ", kana: ["は", "ま", "や", "ら", "わ"] },
  { id: "i-top", label: "いきしちに", kana: ["い", "き", "し", "ち", "に"] },
  { id: "i-bottom", label: "ひみり", kana: ["ひ", "み", "り"] },
  { id: "u-top", label: "うくすつぬ", kana: ["う", "く", "す", "つ", "ぬ"] },
  { id: "u-bottom", label: "ふむゆる", kana: ["ふ", "む", "ゆ", "る"] },
  { id: "e-top", label: "えけせてね", kana: ["え", "け", "せ", "て", "ね"] },
  { id: "e-bottom", label: "へめれ", kana: ["へ", "め", "れ"] },
  { id: "o-top", label: "おこそとの", kana: ["お", "こ", "そ", "と", "の"] },
  { id: "o-bottom", label: "ほもよろをん", kana: ["ほ", "も", "よ", "ろ", "を", "ん"] },
];
