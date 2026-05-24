type KanaDisplayProps = {
  kana: string;
  praiseMessage?: string | null;
  statusMessage?: string;
  showCorrectMark?: boolean;
};

export function KanaDisplay({
  kana,
  praiseMessage,
  statusMessage,
  showCorrectMark = false,
}: KanaDisplayProps) {
  return (
    <section className="kana-display">
      <div className={`kana-mark ${showCorrectMark ? "visible" : ""}`}>○</div>
      <div className="kana-character" aria-label={`もじ ${kana}`}>
        {kana}
      </div>
      {praiseMessage ? <p className="praise-message">{praiseMessage}</p> : null}
      {statusMessage ? <p className="status-message">{statusMessage}</p> : null}
    </section>
  );
}
