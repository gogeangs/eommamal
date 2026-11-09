// Content packs: stories, translations, words and pictures edited in the admin screen.
// The built-in content (data.js) is the base; a pack overrides or adds to it at startup.
//
// Where packs come from (see lib/contentStore.ts):
//   1. public/content/pack.json — published with the app (file workflow, today)
//   2. a preview pack kept in this browser while an editor checks their changes
// A Supabase-backed store can later provide the same Pack shape.

import { STORIES, V, refreshIndex } from './index';
import type { LangId, Page, Story, Text } from './types';

export const LANG_IDS: LangId[] = ['ru', 'mn', 'vi', 'uz', 'zh', 'en'];

export interface PackPage extends Partial<Text> {
  ko: string;
  /** image path relative to the app root (content/images/…), or a data: URL in drafts */
  img?: string;
  /** vocabulary ids shown under this page */
  w?: string[];
}

export interface PackStory {
  id: string; // lowercase letters only; equal to a built-in id = edits that story
  kind?: 'story' | 'folk';
  title: Partial<Text> & { ko: string };
  sub?: string;
  pages: PackPage[];
  phrases?: { ko: string; w: string }[];
  /** hidden from the shelf (kept in the pack) */
  hidden?: boolean;
}

export interface PackWord extends Partial<Text> {
  id: string;
  ko: string;
  img?: string;
  /** tile background color */
  bg?: string;
}

export interface Pack {
  version: 1;
  updated?: string;
  stories: PackStory[];
  words: PackWord[];
}

export const emptyPack = (): Pack => ({ version: 1, stories: [], words: [] });

/** Picture overrides for words: id → image path or data URL. */
export const WORD_IMG: Record<string, string> = {};
export const WORD_BG: Record<string, string> = {};

/** Resolves an image reference to a URL the browser can load. */
export function assetUrl(ref: string): string {
  if (/^(data:|blob:|https?:)/.test(ref)) return ref;
  return import.meta.env.BASE_URL + ref.replace(/^\//, '');
}

const blankArt = () => '';

function fillText<T extends Partial<Text>>(target: T, src: Partial<Text>) {
  if (src.ko != null) (target as Partial<Text>).ko = src.ko;
  for (const l of LANG_IDS) if (src[l] != null && src[l] !== '') (target as Partial<Text>)[l] = src[l]!;
}

/** Merges a pack into the live content. Safe to call more than once. */
export function applyPack(pack: Pack | null | undefined) {
  if (!pack || pack.version !== 1) return;

  for (const w of pack.words ?? []) {
    if (!w.id || !w.ko) continue;
    const cur = V[w.id] ?? ({ ko: w.ko, bg: w.bg ?? '#EAF2F7' } as (typeof V)[string]);
    fillText(cur, w);
    for (const l of LANG_IDS) if (!cur[l]) cur[l] = '';
    if (w.bg) { cur.bg = w.bg; WORD_BG[w.id] = w.bg; }
    V[w.id] = cur;
    if (w.img) WORD_IMG[w.id] = w.img;
  }

  for (const ps of pack.stories ?? []) {
    if (!ps.id || !ps.title?.ko) continue;
    let s = STORIES.find((x) => x.id === ps.id);
    if (!s) {
      s = { id: ps.id, title: { ko: ps.title.ko } as Text, sub: '', pages: [], words: [] } as Story;
      STORIES.push(s);
    }
    fillText(s.title, ps.title);
    for (const l of LANG_IDS) if (!s.title[l]) s.title[l] = ps.title.ko;
    if (ps.sub != null) s.sub = ps.sub;
    if (ps.kind) s.folk = ps.kind === 'folk';
    s.hidden = !!ps.hidden;
    if (ps.phrases) s.phrases = ps.phrases.filter((x) => x.ko.trim());

    if (ps.pages?.length) {
      const pages: Page[] = ps.pages.map((pp, i) => {
        const base = s!.pages[i];
        const pg = (base ? { ...base } : { art: blankArt, w: [], ko: '' }) as Page;
        fillText(pg, pp);
        for (const l of LANG_IDS) if (!pg[l]) pg[l] = pg.ko;
        if (pp.img) pg.img = pp.img;
        if (pp.w) pg.w = pp.w.filter((id) => V[id]);
        return pg;
      });
      s.pages = pages;
    }
    s.words = [...new Set(s.pages.flatMap((p) => p.w))];
  }
  refreshIndex();
}
