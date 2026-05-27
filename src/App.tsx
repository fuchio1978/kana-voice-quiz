import { useState } from "react";
import { KanaQuiz } from "./components/KanaQuiz";
import { PracticeSettingsScreen } from "./components/PracticeSettingsScreen";
import { ResultScreen } from "./components/ResultScreen";
import { columnScopes, kanaList, rowScopes } from "./data/kanaData";

export type SessionResult = {
  correctCount: number;
  firstTryCorrectCount: number;
  hintCorrectCount: number;
  practicedKana: string[];
  totalQuestions: number;
};

export type PracticeOrder = "random" | "sequential";
export type HintOrder = "table-first" | "picture-first";
export type QuestionCountSetting = 5 | 10 | 15 | 20 | "all";

export type PracticeSettings = {
  selectedRowScopeIds: string[];
  selectedColumnScopeIds: string[];
  order: PracticeOrder;
  questionCount: QuestionCountSetting;
  hintOrder: HintOrder;
};

export const defaultSettings: PracticeSettings = {
  selectedRowScopeIds: [],
  selectedColumnScopeIds: [],
  order: "random",
  questionCount: 10,
  hintOrder: "table-first",
};

function buildKanaPool(settings: PracticeSettings) {
  const hasRowSelection = settings.selectedRowScopeIds.length > 0;
  const hasColumnSelection = settings.selectedColumnScopeIds.length > 0;

  if (!hasRowSelection && !hasColumnSelection) {
    return kanaList;
  }

  const selectedKana = new Set<string>();

  rowScopes
    .filter((scope) => settings.selectedRowScopeIds.includes(scope.id))
    .forEach((scope) => scope.kana.forEach((kana) => selectedKana.add(kana)));

  columnScopes
    .filter((scope) => settings.selectedColumnScopeIds.includes(scope.id))
    .forEach((scope) => scope.kana.forEach((kana) => selectedKana.add(kana)));

  return kanaList.filter((entry) => selectedKana.has(entry.kana));
}

function App() {
  const [sessionKey, setSessionKey] = useState(0);
  const [result, setResult] = useState<SessionResult | null>(null);
  const [settings, setSettings] = useState<PracticeSettings>(defaultSettings);
  const [hasStarted, setHasStarted] = useState(false);

  const filteredKanaPool = buildKanaPool(settings);
  const resolvedQuestionCount =
    settings.questionCount === "all"
      ? filteredKanaPool.length
      : Math.min(settings.questionCount, filteredKanaPool.length);

  const handleFinish = (nextResult: SessionResult) => {
    setResult(nextResult);
  };

  const handleRestart = () => {
    setResult(null);
    setSessionKey((current) => current + 1);
  };

  const handleOpenSettings = () => {
    setResult(null);
    setHasStarted(false);
  };

  const handleStartPractice = (nextSettings: PracticeSettings) => {
    setSettings(nextSettings);
    setResult(null);
    setHasStarted(true);
    setSessionKey((current) => current + 1);
  };

  return (
    <main className="app-shell">
      <div className="app-card">
        <header className="app-header">
          <p className="eyebrow">ひらがな と おと を つなげよう</p>
          <h1>ひらがな おんれんしゅう</h1>
          <p className="app-description">
            ゆっくりで だいじょうぶ。こえに だして、いっしょに れんしゅうしよう。
          </p>
        </header>

        {!hasStarted ? (
          <PracticeSettingsScreen
            initialSettings={settings}
            onStart={handleStartPractice}
          />
        ) : result ? (
          <ResultScreen result={result} onRestart={handleRestart} />
        ) : (
          <KanaQuiz
            key={sessionKey}
            kanaPool={filteredKanaPool}
            questionCount={resolvedQuestionCount}
            questionOrder={settings.order}
            hintOrder={settings.hintOrder}
            onFinish={handleFinish}
          />
        )}

        {result ? (
          <div className="footer-actions">
            <button className="ghost-button" type="button" onClick={handleOpenSettings}>
              れんしゅうの せっていを かえる
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default App;
