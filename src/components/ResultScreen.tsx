import type { SessionResult } from "../App";

type ResultScreenProps = {
  result: SessionResult;
  onRestart: () => void;
};

export function ResultScreen({ result, onRestart }: ResultScreenProps) {
  return (
    <section className="result-screen">
      <div className="result-badge">🎉</div>
      <h2>10もん おつかれさま！</h2>
      <p className="result-lead">よく がんばったね。きょうの けっか だよ。</p>

      <div className="result-grid">
        <article className="result-card">
          <span>せいかい した かず</span>
          <strong>{result.correctCount} / 10</strong>
        </article>
        <article className="result-card">
          <span>さいしょで せいかい</span>
          <strong>{result.firstTryCorrectCount}</strong>
        </article>
        <article className="result-card">
          <span>ヒントの あとで せいかい</span>
          <strong>{result.hintCorrectCount}</strong>
        </article>
      </div>

      <div className="practiced-list">
        <h3>れんしゅうした もじ</h3>
        <p>{result.practicedKana.join(" ・ ")}</p>
      </div>

      <button className="primary-button" type="button" onClick={onRestart}>
        もういちど やる
      </button>
    </section>
  );
}
