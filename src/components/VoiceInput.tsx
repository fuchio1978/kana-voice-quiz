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
  const isTouchDevice = useMemo(() => {
    if (typeof navigator === "undefined") {
      return false;
    }

    return (
      /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.maxTouchPoints ?? 0) > 1
    );
  }, []);
  const expectedPhrasesKey = useMemo(
    () => (expectedPhrases ?? []).join("|"),
    [expectedPhrases],
  );

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

  useEffect(() => {
    if (stopTimeoutRef.current) {
      window.clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
    session?.stop({ manual: true });
    setSession(null);
    setIsListening(false);
    setLastErrorCode(null);
  }, [expectedPhrasesKey]);

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
        setSession(null);
        setLastErrorCode(null);
        onResult(result);
      },
      onError: (message) => {
        setIsListening(false);
        setSession(null);
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
      setSession(null);
      stopTimeoutRef.current = null;
    }, isTouchDevice ? Math.max(releaseDelayMs, 1200) : releaseDelayMs);
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

  const handleTouchToggle = () => {
    if (isListening) {
      handleStop();
      return;
    }

    handlePressStart();
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
        className={`voice-action-button ${isListening ? "holding" : ""}`}
        type="button"
        onClick={isTouchDevice ? handleTouchToggle : undefined}
        onPointerDown={!isTouchDevice ? handlePressStart : undefined}
        onPointerUp={!isTouchDevice ? handlePressEnd : undefined}
        onPointerLeave={!isTouchDevice ? handlePressEnd : undefined}
        onPointerCancel={!isTouchDevice ? handlePressEnd : undefined}
        onKeyDown={(event) => {
          if ((event.key === " " || event.key === "Enter") && !event.repeat) {
            event.preventDefault();
            if (isTouchDevice) {
              handleTouchToggle();
            } else {
              handlePressStart();
            }
          }
        }}
        onKeyUp={(event) => {
          if (!isTouchDevice && (event.key === " " || event.key === "Enter")) {
            event.preventDefault();
            handlePressEnd();
          }
        }}
        disabled={!isSupported}
      >
        <span className="voice-action-icon" aria-hidden="true">
          {isListening ? "🎙️" : "🎤"}
        </span>
        <span className="voice-action-copy">
          <strong>
            {isTouchDevice
              ? isListening
                ? "もういちど おすと おわるよ"
                : "おすと ききはじめる"
              : isListening
                ? "はなすと おわるよ…"
                : "おしている あいだ きいてもらう"}
          </strong>
          <span>
            {isTouchDevice
              ? "タップして こえを きいてもらおう"
              : "マイクの ボタンを おして こえを いれてね"}
          </span>
        </span>
      </button>
      <p className="support-text">
        {isSupported
          ? isTouchDevice
            ? "タップできくときは 1かい おすと ききはじめて、もういちど おすと けっかを みるよ。"
            : "ボタンを おしている あいだだけ きくよ。はなしたら けっかを みるよ。"
          : helperMessage}
      </p>
      <div className="transcript-box">
        <span className="transcript-label">きこえた おと</span>
        <strong>{lastTranscript || "まだ きいていないよ"}</strong>
      </div>
      {lastErrorCode ? <p className="debug-text">状態: {lastErrorCode}</p> : null}
      {errorMessage ? <p className="gentle-alert">{errorMessage}</p> : null}
    </section>
  );
}
