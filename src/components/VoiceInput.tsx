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
  const [permissionState, setPermissionState] = useState<MicrophonePermissionState>("unknown");
  const [lastErrorCode, setLastErrorCode] = useState<string | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);
  const isSupported = useMemo(() => getSpeechRecognitionAvailability(), []);
  const isMountedRef = useRef(true);
  const sessionVersionRef = useRef(0);
  const sessionRef = useRef<SpeechRecognitionSession | null>(null);
  const stopTimeoutRef = useRef<number | null>(null);
  const sessionWatchdogRef = useRef<number | null>(null);
  const recoveryTimeoutRef = useRef<number | null>(null);
  const hasTouchSupport = useMemo(() => {
    if (typeof navigator === "undefined" || typeof window === "undefined") {
      return false;
    }

    return (navigator.maxTouchPoints ?? 0) > 0 || "ontouchstart" in window;
  }, []);
  const expectedPhrasesKey = useMemo(
    () => (expectedPhrases ?? []).join("|"),
    [expectedPhrases],
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      sessionVersionRef.current += 1;
      if (stopTimeoutRef.current) {
        window.clearTimeout(stopTimeoutRef.current);
      }
      if (sessionWatchdogRef.current) {
        window.clearTimeout(sessionWatchdogRef.current);
      }
      if (recoveryTimeoutRef.current) {
        window.clearTimeout(recoveryTimeoutRef.current);
      }
      sessionRef.current?.stop({ manual: true, force: true });
      sessionRef.current = null;
    };
  }, []);

  useEffect(() => {
    void getMicrophonePermissionState().then(setPermissionState);
  }, []);

  useEffect(() => {
    sessionVersionRef.current += 1;
    if (stopTimeoutRef.current) {
      window.clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
    if (sessionWatchdogRef.current) {
      window.clearTimeout(sessionWatchdogRef.current);
      sessionWatchdogRef.current = null;
    }
    if (recoveryTimeoutRef.current) {
      window.clearTimeout(recoveryTimeoutRef.current);
      recoveryTimeoutRef.current = null;
    }
    sessionRef.current?.stop({ manual: true, force: true });
    sessionRef.current = null;
    setIsListening(false);
    setIsRecovering(false);
    setLastErrorCode(null);
  }, [expectedPhrasesKey]);

  const resetRecognitionState = (showMessage = false) => {
    if (stopTimeoutRef.current) {
      window.clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
    if (sessionWatchdogRef.current) {
      window.clearTimeout(sessionWatchdogRef.current);
      sessionWatchdogRef.current = null;
    }
    if (recoveryTimeoutRef.current) {
      window.clearTimeout(recoveryTimeoutRef.current);
      recoveryTimeoutRef.current = null;
    }
    sessionRef.current?.stop({ manual: true, force: true });
    setIsListening(false);
    setIsRecovering(true);
    setLastErrorCode(null);
    recoveryTimeoutRef.current = window.setTimeout(() => {
      sessionRef.current = null;
      setIsRecovering(false);
      recoveryTimeoutRef.current = null;
    }, 900);
    if (showMessage) {
      onError("マイクを やりなおしたよ。もういちど おして ためしてみよう。");
    } else {
      onError("");
    }
  };

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
    if (!isSupported || isListening || sessionRef.current || isRecovering) {
      return;
    }

    if (stopTimeoutRef.current) {
      window.clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }

    setIsListening(true);
    setLastErrorCode(null);
    onError("");
    const sessionVersion = sessionVersionRef.current + 1;
    sessionVersionRef.current = sessionVersion;

    const nextSession = startSpeechRecognition({
      expectedPhrases,
      onStart: () => {
        if (!isMountedRef.current || sessionVersionRef.current !== sessionVersion) {
          return;
        }
        setIsListening(true);
      },
      onResult: (result) => {
        if (!isMountedRef.current || sessionVersionRef.current !== sessionVersion) {
          return;
        }
        if (sessionWatchdogRef.current) {
          window.clearTimeout(sessionWatchdogRef.current);
          sessionWatchdogRef.current = null;
        }
        setIsListening(false);
        setLastErrorCode(null);
        onResult(result);
      },
      onError: (message) => {
        if (!isMountedRef.current || sessionVersionRef.current !== sessionVersion) {
          return;
        }
        if (sessionWatchdogRef.current) {
          window.clearTimeout(sessionWatchdogRef.current);
          sessionWatchdogRef.current = null;
        }
        setIsListening(false);
        setLastErrorCode(message);
        onError(getRecognitionErrorMessage(message));
      },
      onEnd: () => {
        if (!isMountedRef.current || sessionVersionRef.current !== sessionVersion) {
          return;
        }
        if (sessionWatchdogRef.current) {
          window.clearTimeout(sessionWatchdogRef.current);
          sessionWatchdogRef.current = null;
        }
        if (recoveryTimeoutRef.current) {
          window.clearTimeout(recoveryTimeoutRef.current);
          recoveryTimeoutRef.current = null;
        }
        setIsListening(false);
        sessionRef.current = null;
        setIsRecovering(false);
      },
    });

    if (!nextSession) {
      setIsListening(false);
      sessionRef.current = null;
    }

    sessionRef.current = nextSession;
    sessionWatchdogRef.current = window.setTimeout(() => {
      resetRecognitionState(true);
    }, 6500);
  };

  const handleStop = () => {
    if (!sessionRef.current) {
      return;
    }

    if (hasTouchSupport) {
      setIsListening(false);
      setIsRecovering(true);
      return;
    }

    if (stopTimeoutRef.current) {
      window.clearTimeout(stopTimeoutRef.current);
    }

    stopTimeoutRef.current = window.setTimeout(() => {
      sessionRef.current?.stop({ manual: true });
      setIsRecovering(true);
      recoveryTimeoutRef.current = window.setTimeout(() => {
        sessionRef.current = null;
        setIsRecovering(false);
        recoveryTimeoutRef.current = null;
      }, 900);
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
        className={`voice-action-button ${isListening ? "holding" : ""}`}
        type="button"
        onPointerDown={!hasTouchSupport ? handlePressStart : undefined}
        onPointerUp={!hasTouchSupport ? handlePressEnd : undefined}
        onPointerLeave={!hasTouchSupport ? handlePressEnd : undefined}
        onPointerCancel={!hasTouchSupport ? handlePressEnd : undefined}
        onTouchStart={
          hasTouchSupport
            ? (event) => {
                event.preventDefault();
                handlePressStart();
              }
            : undefined
        }
        onTouchEnd={
          hasTouchSupport
            ? (event) => {
                event.preventDefault();
                handlePressEnd();
              }
            : undefined
        }
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
        <span className="voice-action-icon" aria-hidden="true">
          {isListening ? "🎙️" : "🎤"}
        </span>
        <span className="voice-action-copy">
          <strong>
            {isListening ? "はなすと おわるよ…" : "おしている あいだ きいてもらう"}
          </strong>
          <span>
            マイクの ボタンを おして こえを いれてね
          </span>
        </span>
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
      <div className="button-row">
        <button
          className="ghost-button"
          type="button"
          onClick={() => resetRecognitionState(true)}
        >
          マイクを やりなおす
        </button>
      </div>
      {lastErrorCode ? <p className="debug-text">状態: {lastErrorCode}</p> : null}
      {isRecovering ? (
        <p className="debug-text">マイクを ととのえているよ… ちょっと まってね</p>
      ) : null}
      {errorMessage ? <p className="gentle-alert">{errorMessage}</p> : null}
    </section>
  );
}
