type RecognitionConstructor = new () => SpeechRecognition;
type SpeechGrammarListConstructor = new () => SpeechGrammarList;
export type MicrophonePermissionState =
  | "prompt"
  | "granted"
  | "denied"
  | "unsupported"
  | "unknown";

declare global {
  interface Window {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
    SpeechGrammarList?: SpeechGrammarListConstructor;
    webkitSpeechGrammarList?: SpeechGrammarListConstructor;
  }

  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
  }

  interface SpeechRecognition extends EventTarget {
    lang: string;
    interimResults: boolean;
    maxAlternatives: number;
    continuous: boolean;
    grammars?: SpeechGrammarList;
    onstart: (() => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
  }
  interface SpeechGrammarList {
    addFromString: (string: string, weight?: number) => void;
  }
}

type StartSpeechRecognitionOptions = {
  expectedPhrases?: string[];
  onStart: () => void;
  onResult: (result: { transcript: string; alternatives: string[] }) => void;
  onError: (message: string) => void;
  onEnd: () => void;
};

export type SpeechRecognitionSession = {
  stop: (options?: { manual?: boolean }) => void;
};

function getRecognitionClass(): RecognitionConstructor | null {
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

function getSpeechGrammarListClass(): SpeechGrammarListConstructor | null {
  return window.SpeechGrammarList ?? window.webkitSpeechGrammarList ?? null;
}

export function getSpeechRecognitionAvailability() {
  return typeof window !== "undefined" && Boolean(getRecognitionClass());
}

export async function getMicrophonePermissionState(): Promise<MicrophonePermissionState> {
  if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return "unsupported";
  }

  if (!navigator.permissions?.query) {
    return "unknown";
  }

  try {
    const status = await navigator.permissions.query({
      name: "microphone" as PermissionName,
    });
    if (status.state === "granted" || status.state === "prompt" || status.state === "denied") {
      return status.state;
    }
    return "unknown";
  } catch {
    return "unknown";
  }
}

export async function requestMicrophoneAccess() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("unsupported");
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  stream.getTracks().forEach((track) => track.stop());
}

export function getRecognitionErrorMessage(error: string) {
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
      return "マイクの きょかが ひつようだよ。みぎうえ や じゅうしょばー の マイクを みてみよう。";
    case "audio-capture":
      return "マイクが みつからないみたい。マイクが つながっているか みてみよう。";
    case "no-speech":
      return "こえが きこえなかったよ。ボタンを おしてから、ゆっくり いってみよう。";
    case "network":
      return "おんせいにんしきが つながらなかったよ。もういちど ためしてみよう。";
    case "aborted":
      return "ききとりを とめたよ。もういちど ボタンを おしてね。";
    case "busy":
      return "マイクが まだ じゅんびちゅう みたい。すこし まってから もういちど おしてね。";
    case "unsupported":
      return "この ぶらうざでは おんせいにんしきが むずかしいみたい。";
    default:
      return "うまく きけなかったよ。もういちど ボタンを おしてみよう。";
  }
}

export function startSpeechRecognition(
  options: StartSpeechRecognitionOptions,
): SpeechRecognitionSession | null {
  const RecognitionClass = getRecognitionClass();
  if (!RecognitionClass) {
    options.onError("not-supported");
    return null;
  }

  const recognition = new RecognitionClass();
  recognition.lang = "ja-JP";
  recognition.interimResults = true;
  recognition.maxAlternatives = 5;
  recognition.continuous = false;

  const GrammarListClass = getSpeechGrammarListClass();
  if (GrammarListClass && options.expectedPhrases?.length) {
    const grammarList = new GrammarListClass();
    const escapedTokens = options.expectedPhrases
      .map((phrase) => phrase.trim())
      .filter(Boolean)
      .map((phrase) => phrase.replace(/[;=|<>]/g, ""))
      .join(" | ");

    if (escapedTokens) {
      grammarList.addFromString(`#JSGF V1.0; grammar kana; public <kana> = ${escapedTokens} ;`, 1);
      recognition.grammars = grammarList;
    }
  }

  let stopTimer: number | null = null;
  let finalTranscript = "";
  let finalAlternatives: string[] = [];
  let hasDeliveredResult = false;
  let manuallyStopped = false;

  recognition.onstart = () => {
    options.onStart();
    stopTimer = window.setTimeout(() => {
      recognition.stop();
    }, 2800);
  };

  recognition.onresult = (event) => {
    let combinedTranscript = "";
    const collectedAlternatives = new Set<string>();

    for (let i = 0; i < event.results.length; i += 1) {
      const result = event.results[i];
      const primaryAlternative = result?.[0]?.transcript ?? "";
      combinedTranscript += primaryAlternative;

      for (let j = 0; j < result.length; j += 1) {
        const alternative = result[j]?.transcript ?? "";
        if (alternative) {
          collectedAlternatives.add(alternative);
        }
      }
    }

    finalTranscript = combinedTranscript;
    finalAlternatives = [...collectedAlternatives];

    const latestResult = event.results[event.results.length - 1];
    if (latestResult?.isFinal) {
      if (stopTimer) {
        window.clearTimeout(stopTimer);
      }
      hasDeliveredResult = true;
      options.onResult({
        transcript: finalTranscript,
        alternatives: finalAlternatives,
      });
      recognition.stop();
    }
  };

  recognition.onerror = (event) => {
    if (stopTimer) {
      window.clearTimeout(stopTimer);
    }
    if (event.error === "aborted" && manuallyStopped) {
      return;
    }
    options.onError(event.error);
  };

  recognition.onend = () => {
    if (stopTimer) {
      window.clearTimeout(stopTimer);
    }
    if (finalTranscript && !hasDeliveredResult) {
      options.onResult({
        transcript: finalTranscript,
        alternatives: finalAlternatives,
      });
    }
    finalTranscript = "";
    finalAlternatives = [];
    hasDeliveredResult = false;
    options.onEnd();
  };

  try {
    recognition.start();
  } catch {
    options.onError("busy");
    return null;
  }

  return {
    stop: (stopOptions) => {
      manuallyStopped = Boolean(stopOptions?.manual);
      recognition.stop();
    },
  };
}

export function speakKana(text: string) {
  if (!("speechSynthesis" in window)) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = 0.85;
  utterance.pitch = 1.05;

  const japaneseVoice = window
    .speechSynthesis
    .getVoices()
    .find((voice) => voice.lang.startsWith("ja"));

  if (japaneseVoice) {
    utterance.voice = japaneseVoice;
  }

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
