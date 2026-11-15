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

import { audioHash } from './audioHash';

const synth: SpeechSynthesis | undefined =
  typeof window !== 'undefined' ? window.speechSynthesis : undefined;

interface Recording {
  file: string;
  textHash: string;
  audioHash?: string;
  durationMs?: number;
}
interface AudioManifest {
  version: number;
  languages: Record<string, { complete: boolean; count: number }>;
  entries: Record<string, Recording>;
}
const voiceListeners = new Set<() => void>();
const recordings = new Map<string, Recording>();
const recordedLanguages = new Set<string>();
const notifyVoices = () => voiceListeners.forEach(fn => fn());
synth?.addEventListener?.('voiceschanged', notifyVoices);

/** Load metadata in advance; the small JSON is PWA-precached, never the MP3s. */
if (typeof window !== 'undefined') {
  fetch(import.meta.env.BASE_URL + 'audio/manifest.json')
    .then(r => { if (!r.ok) throw new Error('No audio manifest'); return r.json() as Promise<AudioManifest>; })
    .then(m => {
      if (m.version !== 1 || !m.entries || !m.languages) return;
      recordings.clear();
      recordedLanguages.clear();
      for (const [language, state] of Object.entries(m.languages)) {
        if (state.complete && state.count > 0) recordedLanguages.add(language);
      }
      for (const [id, entry] of Object.entries(m.entries)) {
        const language = id.split('/')[0];
        if (!/^(ko|ru|mn|vi|uz|zh|en)$/.test(language)) continue;
        if (!entry.file?.startsWith(language + '/') || entry.file.includes('..')) continue;
        if (!/^[a-f0-9]{64}$/.test(entry.textHash)) continue;
        recordings.set(language + ':' + entry.textHash, entry);
      }
      notifyVoices();
    })
    .catch(() => { /* Missing manifest leaves the original browser voices intact. */ });
}
export function onVoicesChanged(f: () => void) {
  voiceListeners.add(f);
  return () => { voiceListeners.delete(f); };
}
export const speechSupported = () => !!synth || typeof Audio !== 'undefined';

export function pickVoice(code: string): SpeechSynthesisVoice | null {
  if (!synth) return null;
  const voices = synth.getVoices();
  const base = code.split('-')[0].toLowerCase();
  return (
    voices.find(v => v.lang.replace('_', '-').toLowerCase() === code.toLowerCase()) ??
    voices.find(v => v.lang.toLowerCase().startsWith(base)) ??
    null
  );
}
export const hasVoice = (code: string) =>
  recordedLanguages.has(code.split('-')[0].toLowerCase()) || !!pickVoice(code);

function clearHighlight() {
  document.querySelectorAll('.speaking').forEach(e => e.classList.remove('speaking'));
}

let cancelCurrent: (() => void) | null = null;
let generation = 0;

/** Read sequentially: valid recording first, existing browser TTS as fallback. */
export function speak(items: SpeechItem[], onEnd?: () => void): boolean {
  stopSpeaking();
  if (!items.length || (!synth && !recordings.size)) return false;
  const token = generation;
  let index = 0;
  const next = () => {
    if (generation !== token) return;
    clearHighlight();
    if (index >= items.length) { cancelCurrent = null; onEnd?.(); return; }
    const item = items[index++];
    const language = item.lang.split('-')[0].toLowerCase();
    const recording = recordings.get(language + ':' + audioHash(item.text));
    let finished = false;
    const timers: number[] = [];
    const clearTimers = () => { timers.forEach(clearTimeout); timers.length = 0; };
    const finish = () => {
      if (finished || token !== generation) return;
      finished = true;
      clearTimers();
      item.onDone?.();
      next();
    };
    const highlight = () => {
      if (item.highlightId && !item.onWord) document.getElementById(item.highlightId)?.classList.add('speaking');
    };
    const schedule = (durationMs: number) => {
      if (!item.onWord) return;
      const starts = wordStarts(item.text);
      const total = Math.max(1, item.text.length);
      starts.forEach(s => {
        const t = Math.min(Math.max(0, durationMs - 30), Math.round(durationMs * s / total));
        timers.push(window.setTimeout(() => {
          if (generation === token && !finished) item.onWord?.(s);
        }, t));
      });
    };
    const browserSpeech = () => {
      if (generation !== token || finished) return;
      clearTimers();
      if (!synth || typeof SpeechSynthesisUtterance === 'undefined') { finish(); return; }
      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.lang = item.lang;
      const voice = pickVoice(item.lang);
      if (voice) utterance.voice = voice;
      utterance.rate = item.rate ?? 0.85;
      let boundary = false;
      utterance.onboundary = e => {
        if (e.name && e.name !== 'word') return;
        if (!boundary) { boundary = true; clearTimers(); }
        item.onWord?.(e.charIndex);
      };
      utterance.onstart = () => {
        if (boundary) return;
        const cjk = /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/.test(item.text);
        const perChar = (cjk ? 260 : 75) / (utterance.rate || 1);
        const starts = wordStarts(item.text);
        let t = 0;
        starts.forEach((s, i) => {
          timers.push(window.setTimeout(() => {
            if (!boundary && !finished && generation === token) item.onWord?.(s);
          }, t));
          const end = starts[i + 1] ?? item.text.length;
          t += Math.max(1, end - s) * perChar + 60;
        });
      };
      utterance.onend = finish;
      utterance.onerror = finish;
      cancelCurrent = () => { clearTimers(); utterance.onend = null; utterance.onerror = null; synth.cancel(); };
      highlight();
      synth.speak(utterance);
    };
    if (!recording || typeof Audio === 'undefined') { browserSpeech(); return; }
    const audio = new Audio();
    const version = recording.audioHash ? '?v=' + recording.audioHash.slice(0, 16) : '';
    audio.src = import.meta.env.BASE_URL + 'audio/' + recording.file + version;
    // Files are synthesized at a child-friendly rate. Preserve the relative rate
    // changes requested by dictation (e.g. its slow-repeat button).
    audio.playbackRate = Math.min(1.5, Math.max(0.5, (item.rate ?? 0.85) / 0.85));
    let fallback = false;
    const onFailure = () => {
      if (fallback || finished || generation !== token) return;
      fallback = true;
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      browserSpeech();
    };
    audio.onloadedmetadata = () => {
      const ms = Number.isFinite(audio.duration) ? audio.duration * 1000 / audio.playbackRate : recording.durationMs ?? 0;
      if (ms > 0) schedule(ms);
    };
    audio.onended = finish;
    audio.onerror = onFailure;
    cancelCurrent = () => {
      clearTimers();
      audio.onended = null; audio.onerror = null; audio.onloadedmetadata = null;
      audio.pause(); audio.removeAttribute('src'); audio.load();
    };
    highlight();
    // No pre-fetch await: iOS requires play() within the tap's user-activation window.
    audio.play().catch(onFailure);
  };
  next();
  return true;
}
export function stopSpeaking() {
  generation++;
  cancelCurrent?.();
  cancelCurrent = null;
  synth?.cancel();
  if (typeof document !== 'undefined') clearHighlight();
}
