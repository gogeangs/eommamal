// Read-aloud through the browser's speech engine. Recorded audio can replace this later
// (see docs/ROADMAP.md); callers only use speak() and stopSpeaking().

export interface SpeechItem {
  text: string;
  lang: string; // BCP-47, e.g. 'ko-KR'
  rate?: number;
  /** id of an element to highlight while this item is spoken */
  highlightId?: string;
  /**
   * Called with the character offset of each word as it is spoken.
   * Uses the engine's word-boundary events; when a voice does not send them,
   * offsets are estimated from text length so highlighting still moves along.
   */
  onWord?: (charIndex: number) => void;
  /** called when this item finishes */
  onDone?: () => void;
}

/** Character offsets where each word starts. */
export function wordStarts(text: string): number[] {
  const out: number[] = [];
  const Seg = (Intl as unknown as { Segmenter?: new (l?: string, o?: object) => { segment(t: string): Iterable<{ index: number; isWordLike?: boolean }> } }).Segmenter;
  if (Seg && /[\u3040-\u30ff\u3400-\u9fff]/.test(text)) {
    for (const s of new Seg(undefined, { granularity: 'word' }).segment(text)) if (s.isWordLike) out.push(s.index);
    return out;
  }
  const re = /\S+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) out.push(m.index);
  return out;
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
let current: (() => void) | null = null;

export function speak(items: SpeechItem[], onEnd?: () => void): boolean {
  if (!synth) return false;
  current?.();
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
    if (it.highlightId && !it.onWord) document.getElementById(it.highlightId)?.classList.add('speaking');

    // Word timing: real boundary events win; otherwise an estimate based on text length.
    let gotBoundary = false;
    let timers: number[] = [];
    const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
    if (it.onWord) {
      const starts = wordStarts(it.text);
      u.onboundary = (e) => {
        if (e.name && e.name !== 'word') return;
        if (!gotBoundary) { gotBoundary = true; clearTimers(); }
        it.onWord!(e.charIndex);
      };
      u.onstart = () => {
        if (gotBoundary) return;
        const cjk = /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/.test(it.text);
        const msPerChar = (cjk ? 260 : 75) / (u.rate || 1);
        let t = 0;
        starts.forEach((s, k) => {
          timers.push(window.setTimeout(() => !gotBoundary && it.onWord!(s), t));
          const end = k + 1 < starts.length ? starts[k + 1] : it.text.length;
          t += Math.max(1, end - s) * msPerChar + 60;
        });
      };
    }
    const finish = () => { clearTimers(); it.onDone?.(); next(); };
    u.onend = finish;
    u.onerror = finish;
    current = clearTimers;
    synth.speak(u);
  };
  next();
  return true;
}

export function stopSpeaking() {
  current?.();
  current = null;
  synth?.cancel();
  clearHighlight();
}
