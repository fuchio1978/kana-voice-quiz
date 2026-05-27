import { useMemo, useState } from "react";
import { defaultSettings, type PracticeSettings } from "../App";
import { columnScopes, rowScopes } from "../data/kanaData";

type PracticeSettingsScreenProps = {
  initialSettings: PracticeSettings;
  onStart: (settings: PracticeSettings) => void;
};

function toggleValue(values: string[], nextValue: string) {
  return values.includes(nextValue)
    ? values.filter((value) => value !== nextValue)
    : [...values, nextValue];
}

export function PracticeSettingsScreen({
  initialSettings,
  onStart,
}: PracticeSettingsScreenProps) {
  const [settings, setSettings] = useState<PracticeSettings>(initialSettings);

  const selectedCount = useMemo(() => {
    const rowKana = rowScopes
      .filter((scope) => settings.selectedRowScopeIds.includes(scope.id))
      .flatMap((scope) => scope.kana);
    const columnKana = columnScopes
      .filter((scope) => settings.selectedColumnScopeIds.includes(scope.id))
      .flatMap((scope) => scope.kana);

    return new Set([...rowKana, ...columnKana]).size || 46;
  }, [settings]);

  return (
    <section className="settings-screen">
      <div className="settings-panel">
        <h2>れんしゅうの せってい</h2>
        <p className="support-text">
          れんしゅうしたい ばしょを えらんで から はじめよう。
        </p>

        <div className="settings-sections">
          <div className="settings-block">
            <h3>よこの れんしゅう</h3>
            <div className="settings-chip-grid">
              {rowScopes.map((scope) => {
                const isSelected = settings.selectedRowScopeIds.includes(scope.id);
                return (
                  <button
                    key={scope.id}
                    className={`settings-chip ${isSelected ? "selected" : ""}`}
                    type="button"
                    onClick={() =>
                      setSettings((current) => ({
                        ...current,
                        selectedRowScopeIds: toggleValue(current.selectedRowScopeIds, scope.id),
                      }))
                    }
                  >
                    {scope.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="settings-block">
            <h3>たての れんしゅう</h3>
            <div className="settings-chip-grid">
              {columnScopes.map((scope) => {
                const isSelected = settings.selectedColumnScopeIds.includes(scope.id);
                return (
                  <button
                    key={scope.id}
                    className={`settings-chip ${isSelected ? "selected" : ""}`}
                    type="button"
                    onClick={() =>
                      setSettings((current) => ({
                        ...current,
                        selectedColumnScopeIds: toggleValue(
                          current.selectedColumnScopeIds,
                          scope.id,
                        ),
                      }))
                    }
                  >
                    {scope.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="settings-block">
            <h3>もんだい すう</h3>
            <div className="settings-order-row">
              {[5, 10, 15, 20, "all"].map((count) => (
                <button
                  key={count}
                  className={`settings-chip ${settings.questionCount === count ? "selected" : ""}`}
                  type="button"
                  onClick={() =>
                    setSettings((current) => ({
                      ...current,
                      questionCount: count as PracticeSettings["questionCount"],
                    }))
                  }
                >
                  {count === "all" ? "ぜんぶ" : `${count}もん`}
                </button>
              ))}
            </div>
          </div>

          <div className="settings-block">
            <h3>もんだいの じゅんばん</h3>
            <div className="settings-order-row">
              <button
                className={`settings-chip ${settings.order === "sequential" ? "selected" : ""}`}
                type="button"
                onClick={() =>
                  setSettings((current) => ({
                    ...current,
                    order: "sequential",
                  }))
                }
              >
                じゅんばんどおり
              </button>
              <button
                className={`settings-chip ${settings.order === "random" ? "selected" : ""}`}
                type="button"
                onClick={() =>
                  setSettings((current) => ({
                    ...current,
                    order: "random",
                  }))
                }
              >
                ランダム
              </button>
            </div>
          </div>

          <div className="settings-block settings-block-wide">
            <h3>ヒントの じゅんばん</h3>
            <div className="settings-order-row">
              <button
                className={`settings-chip ${settings.hintOrder === "table-first" ? "selected" : ""}`}
                type="button"
                onClick={() =>
                  setSettings((current) => ({
                    ...current,
                    hintOrder: "table-first",
                  }))
                }
              >
                ごじゅうおんひょう → え
              </button>
              <button
                className={`settings-chip ${settings.hintOrder === "picture-first" ? "selected" : ""}`}
                type="button"
                onClick={() =>
                  setSettings((current) => ({
                    ...current,
                    hintOrder: "picture-first",
                  }))
                }
              >
                え → ごじゅうおんひょう
              </button>
            </div>
          </div>
        </div>

        <div className="settings-summary">
          <p>れんしゅうする もじ: {selectedCount} こ</p>
          <p>なにも えらばない ときは ぜんぶ でます</p>
        </div>

        <div className="button-row">
          <button
            className="secondary-button"
            type="button"
            onClick={() => setSettings(defaultSettings)}
          >
            ぜんぶに もどす
          </button>
          <button className="primary-button" type="button" onClick={() => onStart(settings)}>
            れんしゅうを はじめる
          </button>
        </div>
      </div>
    </section>
  );
}
