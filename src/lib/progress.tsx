// Learner settings and progress, kept in this browser (localStorage).
// A server-backed store (Supabase) can replace this module without touching the screens.
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { LangId } from '../content/types';

const PREFIX = 'emb-';

function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(PREFIX + key);
    return v == null ? fallback : (JSON.parse(v) as T);
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage unavailable: keep working in memory */
  }
}

export type ReadMode = 'both' | 'mo' | 'ko';
export type WriteMode = 'blocks' | 'keys';

export interface Progress {
  lang: LangId;
  langChosen: boolean; // false until the family picks their language once
  mode: ReadMode;
  scope: string;
  dictMode: WriteMode;
  learned: string[]; // got right in the word game or dictation
  written: string[]; // spelled correctly in dictation
  traced: string[]; // finished stroke-order tracing
  quizStars: Record<string, number>; // best first-try score per story
  dictStars: Record<string, number>;
  pages: Record<string, number>; // last page read per story
}

const DEFAULTS: Progress = {
  lang: 'ru',
  langChosen: false,
  mode: 'both',
  scope: 'all',
  dictMode: 'blocks',
  learned: [],
  written: [],
  traced: [],
  quizStars: {},
  dictStars: {},
  pages: {},
};

function load(): Progress {
  const p = { ...DEFAULTS };
  (Object.keys(DEFAULTS) as (keyof Progress)[]).forEach((k) => {
    (p as Record<string, unknown>)[k] = read(k, DEFAULTS[k]);
  });
  return p;
}

interface Ctx {
  p: Progress;
  set: <K extends keyof Progress>(key: K, value: Progress[K]) => void;
  addWord: (list: 'learned' | 'written' | 'traced', id: string) => void;
  bestScore: (kind: 'quizStars' | 'dictStars', storyId: string, score: number) => void;
}

const ProgressContext = createContext<Ctx | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [p, setP] = useState<Progress>(load);

  const set = useCallback(<K extends keyof Progress>(key: K, value: Progress[K]) => {
    write(key, value);
    setP((prev) => ({ ...prev, [key]: value }));
  }, []);

  const addWord = useCallback((list: 'learned' | 'written' | 'traced', id: string) => {
    setP((prev) => {
      if (prev[list].includes(id)) return prev;
      const next = [...prev[list], id];
      write(list, next);
      return { ...prev, [list]: next };
    });
  }, []);

  const bestScore = useCallback((kind: 'quizStars' | 'dictStars', storyId: string, score: number) => {
    setP((prev) => {
      const next = { ...prev[kind], [storyId]: Math.max(prev[kind][storyId] ?? 0, score) };
      write(kind, next);
      return { ...prev, [kind]: next };
    });
  }, []);

  const value = useMemo(() => ({ p, set, addWord, bestScore }), [p, set, addWord, bestScore]);
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const c = useContext(ProgressContext);
  if (!c) throw new Error('useProgress must be used inside ProgressProvider');
  return c;
}
