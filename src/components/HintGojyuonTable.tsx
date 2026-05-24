import { gojyuonRows, type KanaEntry } from "../data/kanaData";

type HintGojyuonTableProps = {
  entry: KanaEntry;
};

export function HintGojyuonTable({ entry }: HintGojyuonTableProps) {
  return (
    <section className="panel hint-gojyuon-panel">
      <h2>ヒント 1</h2>
      <p className="support-text">いまの もじを みつけてみよう。</p>
      <div className="gojyuon-grid" role="table" aria-label="ごじゅうおんひょう">
        {gojyuonRows.map((row) => (
          <div className="gojyuon-row" key={row.row} role="row">
            <div
              className={`gojyuon-label ${row.row === entry.row ? "current-row" : ""}`}
              role="rowheader"
            >
              {row.row}
            </div>
            {row.kana.map((kana, index) => {
              const isCurrent = kana === entry.kana;
              return (
                <div
                  className={`gojyuon-cell ${isCurrent ? "current" : ""} ${kana ? "" : "empty"}`}
                  key={`${row.row}-${index}`}
                  role="cell"
                >
                  {kana || " "}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
