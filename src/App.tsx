import { useState } from "react";
import { KanaQuiz } from "./components/KanaQuiz";
import { ResultScreen } from "./components/ResultScreen";
import { kanaList } from "./data/kanaData";

export type SessionResult = {
  correctCount: number;
  firstTryCorrectCount: number;
  hintCorrectCount: number;
  practicedKana: string[];
};

function App() {
  const [sessionKey, setSessionKey] = useState(0);
  const [result, setResult] = useState<SessionResult | null>(null);

  const handleFinish = (nextResult: SessionResult) => {
    setResult(nextResult);
  };

  const handleRestart = () => {
    setResult(null);
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

        {result ? (
          <ResultScreen result={result} onRestart={handleRestart} />
        ) : (
          <KanaQuiz
            key={sessionKey}
            kanaPool={kanaList}
            questionCount={10}
            onFinish={handleFinish}
          />
        )}
      </div>
    </main>
  );
}

export default App;
