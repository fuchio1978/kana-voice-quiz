type ParentControlsProps = {
  embedded?: boolean;
  onMarkCorrect: () => void;
  onRetry: () => void;
  showRetry?: boolean;
};

export function ParentControls({
  embedded = false,
  onMarkCorrect,
  onRetry,
  showRetry = true,
}: ParentControlsProps) {
  return (
    <section className={embedded ? "embedded-controls" : "panel"}>
      <h2>おうちの ひと ボタン</h2>
      <div className="button-row">
        <button className="secondary-button" type="button" onClick={onMarkCorrect}>
          せいかいに する
        </button>
        {showRetry ? (
          <button className="ghost-button" type="button" onClick={onRetry}>
            もういちど
          </button>
        ) : null}
      </div>
    </section>
  );
}
