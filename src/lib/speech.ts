// Read-aloud through the browser's speech engine. Recorded audio can replace this later
// (see docs/ROADMAP.md); callers only use speak() and stopSpeaking().

export interface SpeechItem {
  text: string;
  lang: string; // BCP-47, e.g. 'ko-KR'
  rate?: number;
  /** id of an element to highlight while this item is spoken */
  highlightId?: string;
}

const synth: SpeechSynthesis | undefined =
  typeof window !== 'undefined' ? window.speechSynthesis : undefined;

// Some browsers load voices asynchronously.
synth?.addEventListener?.('voiceschanged', () => {});

export const speechSupported = () => !!synth;

export function pickVoice(code: string): SpeechSynthesisVoice | null {
  if (!synth) return null;
  const voices = synth.getVoices();
  const base = code.split('-')[0].toLowerCase();
  return (
    voices.find((v) => v.lang.replace('_', '-') === code) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(base)) ??
    null
  );
}

export const hasVoice = (code: string) => !!pickVoice(code);

function clearHighlight() {
  document.querySelectorAll('.speaking').forEach((e) => e.classList.remove('speaking'));
}

/** Speaks items one after another. Returns false when speech is unavailable. */
export function speak(items: SpeechItem[], onEnd?: () => void): boolean {
  if (!synth) return false;
  synth.cancel();
  let i = 0;
  const next = () => {
    clearHighlight();
    if (i >= items.length) {
      onEnd?.();
      return;
    }
    const it = items[i++];
    const u = new SpeechSynthesisUtterance(it.text);
    u.lang = it.lang;
    const v = pickVoice(it.lang);
    if (v) u.voice = v;
    u.rate = it.rate ?? 0.85;
    if (it.highlightId) document.getElementById(it.highlightId)?.classList.add('speaking');
    u.onend = next;
    u.onerror = next;
    synth.speak(u);
  };
  next();
  return true;
}

export function stopSpeaking() {
  synth?.cancel();
  clearHighlight();
}
