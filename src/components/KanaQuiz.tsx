import { useEffect, useMemo, useRef, useState } from "react";
import type { HintOrder, PracticeOrder, SessionResult } from "../App";
import type { KanaEntry } from "../data/kanaData";
import { HintGojyuonTable } from "./HintGojyuonTable";
import { HintPicture } from "./HintPicture";
import { KanaDisplay } from "./KanaDisplay";
import { ParentControls } from "./ParentControls";
import { VoiceInput } from "./VoiceInput";
import { getAcceptedCandidates, isRecognitionMatch } from "../utils/judge";
import { playCorrectSound } from "../utils/sound";
import { speakKana } from "../utils/speech";

type KanaQuizProps = {
  kanaPool: KanaEntry[];
  questionCount: number;
  questionOrder: PracticeOrder;
  hintOrder: HintOrder;
  onFinish: (result: SessionResult) => void;
};

const praiseMessages = ["せいかい！", "すごい！", "よくできたね！"];

function getReleaseDelayMs(kana: string) {
  if (kana === "わ") {
    return 900;
  }

  if (kana === "い" || kana === "ん") {
    return 1400;
  }

  return 650;
}

function shuffleKana(entries: KanaEntry[], count: number) {
  const cloned = [...entries];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[randomIndex]] = [cloned[randomIndex], cloned[i]];
  }
  return cloned.slice(0, count);
}

function buildQuestions(entries: KanaEntry[], count: number, order: PracticeOrder) {
  if (order === "sequential") {
    return entries.slice(0, Math.min(count, entries.length));
  }

  return shuffleKana(entries, Math.min(count, entries.length));
}

export function KanaQuiz({
  kanaPool,
  questionCount,
  questionOrder,
  hintOrder,
  onFinish,
}: KanaQuizProps) {
  const questions = useMemo(
    () => buildQuestions(kanaPool, questionCount, questionOrder),
    [kanaPool, questionCount, questionOrder],
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [showHint1, setShowHint1] = useState(false);
  const [showHint2, setShowHint2] = useState(false);
  const [needsListenTogether, setNeedsListenTogether] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [firstTryCorrectCount, setFirstTryCorrectCount] = useState(0);
  const [hintCorrectCount, setHintCorrectCount] = useState(0);
  const [practicedKana, setPracticedKana] = useState<string[]>([]);
  const [lastTranscript, setLastTranscript] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("こえに だして いってみよう。");
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [praiseMessage, setPraiseMessage] = useState<string | null>(null);
  const [showCorrectMark, setShowCorrectMark] = useState(false);
  const isTransitioningRef = useRef(false);

  const currentEntry = questions[currentIndex];

  useEffect(() => {
    if (currentEntry) {
      setPracticedKana((current) =>
        current.includes(currentEntry.kana) ? current : [...current, currentEntry.kana],
      );
    }
  }, [currentEntry]);

  const goToNextQuestion = (nextTotals: {
    correctCount: number;
    firstTryCorrectCount: number;
    hintCorrectCount: number;
  }) => {
    if (isTransitioningRef.current) {
      return;
    }
    isTransitioningRef.current = true;

    window.setTimeout(() => {
      if (currentIndex >= questions.length - 1) {
        onFinish({
          correctCount: nextTotals.correctCount,
          firstTryCorrectCount: nextTotals.firstTryCorrectCount,
          hintCorrectCount: nextTotals.hintCorrectCount,
          practicedKana,
          totalQuestions: questions.length,
        });
        return;
      }

      setCurrentIndex((index) => index + 1);
      setAttemptCount(0);
      setShowHint1(false);
      setShowHint2(false);
      setNeedsListenTogether(false);
      setLastTranscript("");
      setRecognitionError(null);
      setPraiseMessage(null);
      setShowCorrectMark(false);
      setFeedbackMessage("こえに だして いってみよう。");
      isTransitioningRef.current = false;
    }, 1400);
  };

  const handleCorrect = (wasParentAssist = false) => {
    const nextCorrectCount = correctCount + 1;
    const nextFirstTryCorrectCount =
      attemptCount === 0 && !wasParentAssist
        ? firstTryCorrectCount + 1
        : firstTryCorrectCount;
    const nextHintCorrectCount =
      attemptCount > 0 || wasParentAssist ? hintCorrectCount + 1 : hintCorrectCount;

    playCorrectSound();
    setCorrectCount(nextCorrectCount);
    setFirstTryCorrectCount(nextFirstTryCorrectCount);
    setHintCorrectCount(nextHintCorrectCount);
    setPraiseMessage(praiseMessages[Math.floor(Math.random() * praiseMessages.length)]);
    setFeedbackMessage("つぎの もんだいへ いくよ。");
    setShowCorrectMark(true);
    goToNextQuestion({
      correctCount: nextCorrectCount,
      firstTryCorrectCount: nextFirstTryCorrectCount,
      hintCorrectCount: nextHintCorrectCount,
    });
  };

  const advanceHintState = () => {
    const nextAttempt = attemptCount + 1;
    setAttemptCount(nextAttempt);

    if (nextAttempt === 1) {
      setShowHint1(hintOrder === "table-first");
      setShowHint2(hintOrder === "picture-first");
      setFeedbackMessage("もういちど やってみよう。ヒントを みてみよう。");
      return;
    }

    if (nextAttempt === 2) {
      setShowHint1(true);
      setShowHint2(true);
      setFeedbackMessage("だいじょうぶ。えも みながら いってみよう。");
      return;
    }

    setShowHint1(true);
    setShowHint2(true);
    setNeedsListenTogether(true);
    setFeedbackMessage("だいじょうぶ、いっしょに やろう。");
    speakKana(currentEntry.sound);
  };

  const handleVoiceResult = (result: { transcript: string; alternatives: string[] }) => {
    setLastTranscript(result.transcript);
    setRecognitionError(null);

    if (isRecognitionMatch(result, currentEntry)) {
      handleCorrect(false);
      return;
    }

    advanceHintState();
  };

  const handleRetry = () => {
    setLastTranscript("");
    setRecognitionError(null);
    setFeedbackMessage(
      needsListenTogether
        ? "いっしょに きいてから、もういちど やってみよう。"
        : "もういちど やってみよう。",
    );
  };

  const handleSpeakAgain = () => {
    speakKana(currentEntry.sound);
  };

  if (!currentEntry) {
    return null;
  }

  return (
    <div className="quiz-layout">
      <div className="progress-row">
        <span>
          {currentIndex + 1} / {questions.length} もんめ
        </span>
        <span>{currentEntry.row}</span>
      </div>

      <KanaDisplay
        kana={currentEntry.kana}
        praiseMessage={praiseMessage}
        statusMessage={feedbackMessage}
        showCorrectMark={showCorrectMark}
      />

      <div className="quiz-main-grid">
        <div className="quiz-primary-column">
          <VoiceInput
            expectedPhrases={getAcceptedCandidates(currentEntry)}
            releaseDelayMs={getReleaseDelayMs(currentEntry.kana)}
            onResult={handleVoiceResult}
            onError={setRecognitionError}
            lastTranscript={lastTranscript}
            errorMessage={recognitionError}
          />

          {needsListenTogether ? (
            <section className="panel listen-panel">
              <h2>いっしょに きいてみよう</h2>
              <p className="support-text">
                ただしい おとを きいたら、もういちど いってみよう。
              </p>
              <div className="button-row">
                <button className="secondary-button" type="button" onClick={handleSpeakAgain}>
                  おてほんを きく
                </button>
              </div>
              <ParentControls
                embedded
                onMarkCorrect={() => handleCorrect(true)}
                onRetry={handleRetry}
              />
            </section>
          ) : (
            <ParentControls onMarkCorrect={() => handleCorrect(true)} onRetry={handleRetry} />
          )}
        </div>

        <div className="quiz-secondary-column">
          {showHint1 ? <HintGojyuonTable entry={currentEntry} /> : null}
          {showHint2 ? <HintPicture entry={currentEntry} /> : null}
        </div>
      </div>
    </div>
  );
}
