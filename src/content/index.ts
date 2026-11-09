import { STORIES, V, ICON, UI, LANGS, CULTURE, ASK } from './data.js';
import type { LangId, Story } from './types';

export { STORIES, V, ICON, UI, LANGS, CULTURE, ASK };
export type { LangId, Story };

/** Every vocabulary id, in the order the word book shows them. */
export const ALL_WORDS = Object.keys(V);

/** Pseudo-story used when practising every word at once. */
export const ALL_STORY: Story = {
  id: 'all',
  title: { ko: '모든 낱말', ru: '', mn: '', vi: '', uz: '', zh: '', en: '' },
  sub: '',
  pages: [],
  words: ALL_WORDS,
};

export function findStory(id: string): Story {
  if (id === 'all') return ALL_STORY;
  const s = STORIES.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown story: ${id}`);
  return s;
}

const KO_TO_ID = Object.fromEntries(ALL_WORDS.map((id) => [V[id].ko, id]));
const KO_RE = new RegExp(
  '(' + ALL_WORDS.map((id) => V[id].ko).sort((a, b) => b.length - a.length).join('|') + ')',
  'g',
);

/** Splits a Korean sentence into plain text and vocabulary words, so words can be tapped. */
export function splitKorean(text: string): Array<{ text: string; word?: string }> {
  const out: Array<{ text: string; word?: string }> = [];
  let last = 0;
  for (const m of text.matchAll(KO_RE)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ text: text.slice(last, i) });
    out.push({ text: m[0], word: KO_TO_ID[m[0]] });
    last = i + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

export const syllables = (w: string) => [...w];

export function shuffle<T>(a: T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export const langById = (id: LangId) => LANGS.find((l) => l.id === id)!;

/** Finished word icons under public/images/words, with the light tile color each sits on. */
export const WORD_ART: Record<string, string> = {
  star: '#FFF1C7', night: '#E2E6F2', cat: '#FCE8D4', tree: '#E2EFDF', sky: '#FFF6DA',
  owl: '#F2E6D8', umbrella: '#EAF2F7', rain: '#FFF6DA', puppy: '#F3E9DC',
  frog: '#FFF1C7', sparrow: '#E6F0DF', rainbow: '#EAF2F7', seollal: '#EAF2F7', hanbok: '#E6F0DF',
  grandma: '#FFF1C7', pouch: '#FFF6DA', tteokguk: '#E6F0DF', yut: '#EAF2F7',
};

/** Word pairs whose pictures look alike; the word game never offers one as a wrong choice for the other. */
const LOOKALIKE: [string, string][] = [['sky', 'rainbow'], ['night', 'star']];
export const looksAlike = (a: string, b: string) =>
  LOOKALIKE.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
