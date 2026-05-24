import { useEffect, useMemo, useRef, useState } from "react";
import {
  getMicrophonePermissionState,
  getRecognitionErrorMessage,
  getSpeechRecognitionAvailability,
  requestMicrophoneAccess,
  startSpeechRecognition,
  type MicrophonePermissionState,
  type SpeechRecognitionSession,
} from "../utils/speech";

type VoiceInputProps = {
  expectedPhrases?: string[];
  releaseDelayMs?: number;
  onResult: (result: { transcript: string; alternatives: string[] }) => void;
  onError: (message: string) => void;
  lastTranscript: string;
  errorMessage: string | null;
};

export function VoiceInput({
  expectedPhrases,
  releaseDelayMs = 650,
  onResult,
  onError,
  lastTranscript,
  errorMessage,
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [session, setSession] = useState<SpeechRecognitionSession | null>(null);
  const [permissionState, setPermissionState] = useState<MicrophonePermissionState>("unknown");
  const [lastErrorCode, setLastErrorCode] = useState<string | null>(null);
  const isSupported = useMemo(() => getSpeechRecognitionAvailability(), []);
  const stopTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (stopTimeoutRef.current) {
        window.clearTimeout(stopTimeoutRef.current);
      }
      session?.stop({ manual: true });
    };
  }, [session]);

  useEffect(() => {
    void getMicrophonePermissionState().then(setPermissionState);
  }, []);

  const handlePrepareMic = async () => {
    try {
      await requestMicrophoneAccess();
      setPermissionState("granted");
      onError("");
      setLastErrorCode(null);
      return true;
    } catch {
      setPermissionState("denied");
      onError("マイクの きょかが まだ できていないみたい。");
      return false;
    }
  };

  const handleStart = () => {
    if (!isSupported || isListening || session) {
      return;
    }

    if (stopTimeoutRef.current) {
      window.clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }

    setIsListening(true);
    setLastErrorCode(null);
    onError("");

    const nextSession = startSpeechRecognition({
      expectedPhrases,
      onStart: () => setIsListening(true),
      onResult: (result) => {
        setIsListening(false);
        setLastErrorCode(null);
        onResult(result);
      },
      onError: (message) => {
        setIsListening(false);
        setLastErrorCode(message);
        onError(getRecognitionErrorMessage(message));
      },
      onEnd: () => {
        setIsListening(false);
        setSession(null);
      },
    });

    if (!nextSession) {
      setIsListening(false);
    }

    setSession(nextSession);
  };

  const handleStop = () => {
    if (!session) {
      return;
    }

    if (stopTimeoutRef.current) {
      window.clearTimeout(stopTimeoutRef.current);
    }

    stopTimeoutRef.current = window.setTimeout(() => {
      session.stop({ manual: true });
      stopTimeoutRef.current = null;
    }, releaseDelayMs);
  };

  const handlePressStart = () => {
    if (permissionState === "granted") {
      handleStart();
      return;
    }

    void handlePrepareMic().then((granted) => {
      if (granted) {
        handleStart();
      }
    });
  };

  const handlePressEnd = () => {
    handleStop();
  };

  const helperMessage = !isSupported
    ? "この ぶらうざでは おんせいにんしきが つかえないので、おうちの ひとと すすめよう。"
    : permissionState === "denied"
      ? "マイクが きょひ されているかも。じゅうしょばー の マイクを おして、きょか してみよう。"
      : permissionState === "prompt"
        ? "さいしょに マイクを つかう きょかが ひつようだよ。"
        : "ボタンを おしてから、もじの おとを いってみよう。";

  return (
    <section className="panel">
      <h2>こえで こたえる</h2>
      {isSupported && permissionState !== "granted" ? (
        <button className="ghost-button" type="button" onClick={handlePrepareMic}>
          マイクを つかえるようにする
        </button>
      ) : null}
      <button
        className={`primary-button hold-button ${isListening ? "holding" : ""}`}
        type="button"
        onPointerDown={handlePressStart}
        onPointerUp={handlePressEnd}
        onPointerLeave={handlePressEnd}
        onPointerCancel={handlePressEnd}
        onKeyDown={(event) => {
          if ((event.key === " " || event.key === "Enter") && !event.repeat) {
            event.preventDefault();
            handlePressStart();
          }
        }}
        onKeyUp={(event) => {
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            handlePressEnd();
          }
        }}
        disabled={!isSupported}
      >
        {isListening ? "はなすと おわるよ…" : "おしている あいだ きいてもらう"}
      </button>
      <p className="support-text">
        {isSupported
          ? "ボタンを おしている あいだだけ きくよ。はなしたら けっかを みるよ。"
          : helperMessage}
      </p>
      <div className="transcript-box">
        <span className="transcript-label">きこえた おと</span>
        <strong>{lastTranscript || "まだ きいていないよ"}</strong>
      </div>
      {errorMessage ? <p className="gentle-alert">{errorMessage}</p> : null}
    </section>
  );
}
