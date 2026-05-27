let sharedAudioContext: AudioContext | null = null;

function getAudioContext() {
  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextClass) {
    return null;
  }

  if (!sharedAudioContext || sharedAudioContext.state === "closed") {
    sharedAudioContext = new AudioContextClass();
  }

  return sharedAudioContext;
}

export function playCorrectSound() {
  const context = getAudioContext();
  if (!context) {
    return;
  }
  const now = context.currentTime;

  if (context.state === "suspended") {
    void context.resume();
  }

  const oscillatorA = context.createOscillator();
  const oscillatorB = context.createOscillator();
  const gain = context.createGain();

  oscillatorA.type = "sine";
  oscillatorA.frequency.setValueAtTime(523.25, now);
  oscillatorB.type = "sine";
  oscillatorB.frequency.setValueAtTime(783.99, now + 0.12);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

  oscillatorA.connect(gain);
  oscillatorB.connect(gain);
  gain.connect(context.destination);

  oscillatorA.start(now);
  oscillatorA.stop(now + 0.18);
  oscillatorB.start(now + 0.12);
  oscillatorB.stop(now + 0.32);
}
