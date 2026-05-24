import type { KanaEntry } from "../data/kanaData";

type HintPictureProps = {
  entry: KanaEntry;
};

export function HintPicture({ entry }: HintPictureProps) {
  return (
    <section className="panel hint-picture-panel">
      <h2>ヒント 2</h2>
      <p className="support-text">
        「{entry.kana}」から はじまる ものを みてみよう。
      </p>
      <div className="hint-emoji" aria-hidden="true">
        {entry.emoji}
      </div>
      <p className="hint-word">{entry.word}</p>
    </section>
  );
}
