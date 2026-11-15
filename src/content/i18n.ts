// Every translatable text in the app, as one flat list the translation review screen can show and patch.
// Keys are stable ids ("story.star.p3", "ui.grown.close" …). Corrections are stored as overrides by key
// (Pack.text) and applied over the built-in text at startup, so a fixed typo reaches every device.
import { CULTURE, STORIES, UI, V } from './index';
import type { LangId } from './types';
import { STORY_SUBS } from './storySubs';
import { CHILD_TERMS } from '../lib/childUi';
import { GROWN_TABLES } from '../lib/grownUi';
import { PARENT_TABLES } from '../lib/parentUi';
import { CONTACT_TABLES } from '../lib/contactUi';

export type Group = 'story' | 'word' | 'culture' | 'child' | 'grown';
export const GROUPS: { id: Group; ko: string; en: string }[] = [
  { id: 'story', ko: '동화', en: 'Stories' },
  { id: 'word', ko: '낱말', en: 'Words' },
  { id: 'culture', ko: '문화 카드', en: 'Culture cards' },
  { id: 'child', ko: '아이 화면 문구', en: "Children's screens" },
  { id: 'grown', ko: '보호자 화면 문구', en: 'Parent screens' },
];

export interface Entry {
  key: string;
  group: Group;
  /** where it appears, for the reviewer */
  where: string;
  /** Korean original, when there is one */
  ko?: string;
  /** Korean original that differs per language (culture cards carry a Korean line per country) */
  koFor?: (l: LangId) => string;
  /** English, as a reference for languages other than English */
  en?: string;
  get: (l: LangId) => string;
  set: (l: LangId, v: string) => void;
}

type Dict = Record<string, string>;
const fromTable = (key: string, group: Group, where: string, table: Record<LangId, Dict>, k: string, ko?: string): Entry => ({
  key, group, where, ko, en: table.en?.[k],
  get: (l) => table[l]?.[k] ?? '',
  set: (l, v) => { if (table[l]) table[l][k] = v; },
});

/** Built fresh each time: content packs may add stories and words. */
export function entries(): Entry[] {
  const out: Entry[] = [];

  for (const s of STORIES) {
    const name = s.title.ko;
    out.push({ key: `story.${s.id}.title`, group: 'story', where: `${name} · 제목`, ko: s.title.ko, en: s.title.en,
      get: (l) => s.title[l] ?? '', set: (l, v) => { s.title[l] = v; } });
    const subs = STORY_SUBS[s.id];
    if (subs) out.push({ key: `story.${s.id}.sub`, group: 'story', where: `${name} · 책장 소개`, ko: s.sub, en: subs.en,
      get: (l) => subs[l] ?? '', set: (l, v) => { subs[l] = v; } });
    s.pages.forEach((pg, i) => out.push({ key: `story.${s.id}.p${i + 1}`, group: 'story', where: `${name} · ${i + 1}쪽`, ko: pg.ko, en: pg.en,
      get: (l) => pg[l] ?? '', set: (l, v) => { pg[l] = v; } }));
  }

  for (const [id, w] of Object.entries(V)) out.push({ key: `word.${id}`, group: 'word', where: `낱말 · ${w.ko}`, ko: w.ko, en: w.en,
    get: (l) => w[l] ?? '', set: (l, v) => { w[l] = v; } });

  for (const [sid, set] of Object.entries(CULTURE)) {
    const name = STORIES.find((s) => s.id === sid)?.title.ko ?? sid;
    out.push({ key: `culture.${sid}.head`, group: 'culture', where: `${name} 문화 카드 · 제목`, en: set.cards.en?.head,
      get: (l) => set.cards[l]?.head ?? '', set: (l, v) => { if (set.cards[l]) set.cards[l].head = v; } });
    const n = set.cards.en?.items.length ?? 0;
    for (let i = 0; i < n; i++) out.push({ key: `culture.${sid}.item${i + 1}`, group: 'culture', where: `${name} 문화 카드 · ${i + 1}번`,
      en: set.cards.en.items[i][0], koFor: (l) => set.cards[l]?.items[i]?.[1] ?? '',
      get: (l) => set.cards[l]?.items[i]?.[0] ?? '', set: (l, v) => { const it = set.cards[l]?.items[i]; if (it) it[0] = v; } });
    out.push({ key: `culture.${sid}.ask`, group: 'culture', where: `${name} 문화 카드 · 마지막 질문`, ko: set.askKo, en: set.ask.en,
      get: (l) => set.ask[l] ?? '', set: (l, v) => { set.ask[l] = v; } });
  }
  const uiApp = UI as unknown as Record<LangId, Dict>;
  for (const k of Object.keys(uiApp.en)) out.push(fromTable(`ui.app.${k}`, 'child', `아이 화면 · ${k}`, uiApp, k));
  const terms = CHILD_TERMS as unknown as Record<LangId, Dict>;
  for (const k of Object.keys(terms.en)) out.push(fromTable(`ui.child.${k}`, 'child', `아이 화면 · ${k}`, terms, k));

  const grown = GROWN_TABLES.ALL as unknown as Record<LangId, Dict>;
  for (const k of Object.keys(grown.en)) out.push(fromTable(`ui.grown.${k}`, 'grown', `보호자 화면 · ${k}`, grown, k, (GROWN_TABLES.KO as Dict)[k]));
  const parent = PARENT_TABLES.MO as unknown as Record<LangId, Dict>;
  for (const k of Object.keys(parent.en)) out.push(fromTable(`ui.parent.${k}`, 'grown', `보호자 화면 · ${k}`, parent, k, (PARENT_TABLES.KO as Dict)[k]));
  const contact = CONTACT_TABLES.ALL as unknown as Record<LangId, Dict>;
  for (const k of Object.keys(contact.en)) out.push(fromTable(`ui.contact.${k}`, 'grown', `문의 화면 · ${k}`, contact, k, (CONTACT_TABLES.KO as Dict)[k]));

  return out;
}

/** Korean original for an entry in one language (culture card items carry a Korean line per country). */
export const koOf = (e: Entry, l: LangId) => e.koFor?.(l) ?? e.ko ?? '';

/** The text as shipped with the app, before any correction — captured once, before overrides are applied. */
let shipped: Map<string, Record<string, string>> | null = null;
export function captureShipped(langs: LangId[]) {
  if (shipped) return;
  shipped = new Map(entries().map((e) => [e.key, Object.fromEntries(langs.map((l) => [l, e.get(l)]))]));
}
export const shippedText = (key: string, l: LangId) => shipped?.get(key)?.[l];

/** Applies corrections: { lang: { key: text } }. Unknown keys are ignored. */
export function applyText(text: Partial<Record<LangId, Record<string, string>>> | undefined) {
  if (!text) return;
  const byKey = new Map(entries().map((e) => [e.key, e]));
  for (const [l, m] of Object.entries(text) as [LangId, Record<string, string>][]) {
    for (const [k, v] of Object.entries(m ?? {})) if (typeof v === 'string' && v.trim()) byKey.get(k)?.set(l, v);
  }
}

/** {name}-style placeholders in a text, sorted — a translation must keep the same ones. */
export const placeholders = (s: string) => [...(s.match(/\{\w+\}/g) ?? [])].sort().join(' ');
