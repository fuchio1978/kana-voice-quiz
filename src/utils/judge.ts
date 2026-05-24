import type { KanaEntry } from "../data/kanaData";

type RecognitionPayload = {
  transcript: string;
  alternatives?: string[];
};

const alternateSounds: Record<string, string[]> = {
  い: ["いい", "いー"],
  は: ["わ"],
  わ: ["は"],
  へ: ["え"],
  え: ["へ"],
  に: ["2", "二"],
  を: ["お"],
  ん: ["んー", "うん", "うーん"],
};

function toHiragana(input: string) {
  return input.replace(/[\u30a1-\u30f6]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0x60),
  );
}

function normalizeTranscript(input: string) {
  return toHiragana(input)
    .replace(/[ー〜\-!！?？,、。.\s]/g, "")
    .trim();
}

function compressRepeatedKana(input: string) {
  return input.replace(/(.)\1+/g, "$1");
}

export function getAcceptedCandidates(entry: KanaEntry) {
  const repeated = [entry.kana.repeat(2), `${entry.kana}ー`];
  return [
    entry.kana,
    entry.sound,
    ...repeated,
    ...(alternateSounds[entry.kana] ?? []),
  ];
}

export function isRecognitionMatch(
  transcript: string | RecognitionPayload,
  entry: KanaEntry,
) {
  const accepted = getAcceptedCandidates(entry);
  const recognitionInputs =
    typeof transcript === "string"
      ? [transcript]
      : [transcript.transcript, ...(transcript.alternatives ?? [])];

  return recognitionInputs.some((input) => {
    const normalized = normalizeTranscript(input);
    if (!normalized) {
      return false;
    }

    const compressed = compressRepeatedKana(normalized);

    return accepted.some(
      (candidate) =>
        normalized === candidate ||
        compressed === candidate ||
        normalized.startsWith(candidate) ||
        compressed.startsWith(candidate) ||
        normalized.includes(candidate) ||
        compressed.includes(candidate),
    );
  });
}
