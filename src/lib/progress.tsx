import { g } from './grownUi';
// Learner settings and progress, kept in this browser (localStorage).
// Several children can share one device: each child (profile) has its own set of keys.
// A server-backed store (Supabase) can replace this module without touching the screens.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { LangId } from '../content/types';

const ROOT = 'emb-';

function readKey<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v == null ? fallback : (JSON.parse(v) as T);
  } catch {
    return fallback;
  }
}
/** Fired after the app changes stored progress, so account sync can upload it. */
export const CHANGE_EVENT = 'emb-change';
/** Fired by account sync after it rewrote stored progress, so the screens reload it. */
export const RELOAD_EVENT = 'emb-reload';
const changed = () => { try { window.dispatchEvent(new Event(CHANGE_EVENT)); } catch { /* ignore */ } };

function writeKey(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: keep working in memory */
  }
  changed();
}
function removeKey(key: string) {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}

export type ReadMode = 'both' | 'mo' | 'ko';
export type WriteMode = 'blocks' | 'keys';

export interface Progress {
  lang: LangId;
  langChosen: boolean; // false until the family picks their language once
  mode: ReadMode;
  scope: string;
  dictMode: WriteMode;
  textSize: 'm' | 'l';
  learned: string[]; // got right in the word game or dictation
  written: string[]; // spelled correctly in dictation
  traced: string[]; // finished stroke-order tracing
  sentences: string[]; // phrases spelled correctly in sentence dictation
  quizStars: Record<string, number>; // best first-try score per story
  dictStars: Record<string, number>;
  pages: Record<string, number>; // last page read per story
  lastOpenedStoryId: string; // most recently opened book
  finished: string[]; // stories read to the last page at least once
  misses: Record<string, number>; // word → wrong answers not yet made up for by a later first-try answer
  days: string[]; // dates (YYYY-MM-DD, local) the child read or played, newest last
}

const DEFAULTS: Progress = {
  lang: 'ru',
  langChosen: false,
  mode: 'both',
  scope: 'all',
  dictMode: 'blocks',
  textSize: 'm',
  learned: [],
  written: [],
  traced: [],
  sentences: [],
  quizStars: {},
  dictStars: {},
  pages: {},
  lastOpenedStoryId: '',
  finished: [],
  misses: {},
  days: [],
};
export const PROGRESS_DEFAULTS = DEFAULTS;
export const KEYS = Object.keys(DEFAULTS) as (keyof Progress)[];
/** Settings a new child copies from the child currently using the device. */
const SHARED: (keyof Progress)[] = ['lang', 'langChosen', 'mode', 'textSize', 'dictMode'];

/* ---------- profiles ---------- */

export interface Profile { id: string; name: string; avatar: string }
export const AVATARS = ['cat', 'puppy', 'frog', 'owl', 'sparrow', 'star'];
const FIRST: Profile = { id: 'p1', name: '', avatar: 'cat' };

// The first child keeps the original keys (emb-learned …) so existing records carry over.
export const prefix = (pid: string) => (pid === 'p1' ? ROOT : `${ROOT}${pid}-`);

export function loadProfiles(): Profile[] {
  const list = readKey<Profile[]>(`${ROOT}profiles`, []);
  return list.length ? list : [FIRST];
}

export function load(pid: string): Progress {
  const p = { ...DEFAULTS };
  KEYS.forEach((k) => { (p as Record<string, unknown>)[k] = readKey(prefix(pid) + k, DEFAULTS[k]); });
  return p;
}

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

type WordList = 'learned' | 'written' | 'traced' | 'sentences' | 'finished';

interface Ctx {
  p: Progress;
  set: <K extends keyof Progress>(key: K, value: Progress[K]) => void;
  addWord: (list: WordList, id: string) => void;
  bestScore: (kind: 'quizStars' | 'dictStars', storyId: string, score: number) => void;
  /** a wrong answer for this word (call once per round) */
  miss: (id: string) => void;
  /** a first-try right answer: makes up for one earlier miss */
  hit: (id: string) => void;
  profiles: Profile[];
  profile: Profile;
  switchProfile: (id: string) => void;
  addProfile: (name: string, avatar: string) => void;
  updateProfile: (id: string, patch: Partial<Omit<Profile, 'id'>>) => void;
  removeProfile: (id: string) => void;
  resetProfile: (id: string) => void;
}

const ProgressContext = createContext<Ctx | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>(loadProfiles);
  const [pid, setPid] = useState<string>(() => {
    const id = readKey<string>(`${ROOT}profile`, 'p1');
    return loadProfiles().some((x) => x.id === id) ? id : 'p1';
  });
  const [p, setP] = useState<Progress>(() => load(pid));

  const saveProfiles = (list: Profile[]) => { writeKey(`${ROOT}profiles`, list); setProfiles(list); };

  // Account sync rewrote storage: read everything again.
  useEffect(() => {
    const onReload = () => {
      const list = loadProfiles();
      const id = readKey<string>(`${ROOT}profile`, 'p1');
      const cur = list.some((x) => x.id === id) ? id : list[0].id;
      setProfiles(list);
      setPid(cur);
      setP(load(cur));
    };
    window.addEventListener(RELOAD_EVENT, onReload);
    return () => window.removeEventListener(RELOAD_EVENT, onReload);
  }, []);

  const set = useCallback(<K extends keyof Progress>(key: K, value: Progress[K]) => {
    writeKey(prefix(pid) + key, value);
    setP((prev) => ({ ...prev, [key]: value }));
  }, [pid]);

  /** Applies a change and records today as a learning day. */
  const change = useCallback((fn: (prev: Progress) => Partial<Progress> | null) => {
    setP((prev) => {
      const patch = fn(prev);
      if (!patch) return prev;
      const d = today();
      if (prev.days[prev.days.length - 1] !== d) patch.days = [...prev.days, d].slice(-120);
      (Object.keys(patch) as (keyof Progress)[]).forEach((k) => writeKey(prefix(pid) + k, patch[k]));
      return { ...prev, ...patch };
    });
  }, [pid]);

  const addWord = useCallback((list: WordList, id: string) => {
    change((prev) => (prev[list].includes(id) ? {} : { [list]: [...prev[list], id] }));
  }, [change]);

  const bestScore = useCallback((kind: 'quizStars' | 'dictStars', storyId: string, score: number) => {
    change((prev) => ({ [kind]: { ...prev[kind], [storyId]: Math.max(prev[kind][storyId] ?? 0, score) } }));
  }, [change]);

  const miss = useCallback((id: string) => {
    change((prev) => ({ misses: { ...prev.misses, [id]: (prev.misses[id] ?? 0) + 1 } }));
  }, [change]);

  const hit = useCallback((id: string) => {
    change((prev) => {
      const n = prev.misses[id];
      if (!n) return {};
      const misses = { ...prev.misses };
      if (n > 1) misses[id] = n - 1; else delete misses[id];
      return { misses };
    });
  }, [change]);

  const switchProfile = useCallback((id: string) => {
    writeKey(`${ROOT}profile`, id);
    setPid(id);
    setP(load(id));
  }, []);

  const addProfile = useCallback((name: string, avatar: string) => {
    const id = `p${Date.now().toString(36)}`;
    SHARED.forEach((k) => writeKey(prefix(id) + k, p[k]));
    saveProfiles([...profiles, { id, name, avatar }]);
    switchProfile(id);
  }, [p, profiles, switchProfile]);

  const updateProfile = useCallback((id: string, patch: Partial<Omit<Profile, 'id'>>) => {
    saveProfiles(profiles.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, [profiles]);

  const clearData = (id: string, keepShared: boolean) =>
    KEYS.forEach((k) => { if (!(keepShared && SHARED.includes(k))) removeKey(prefix(id) + k); });

  const removeProfile = useCallback((id: string) => {
    if (profiles.length < 2) return;
    clearData(id, false);
    writeKey(`${ROOT}deleted`, [...readKey<string[]>(`${ROOT}deleted`, []), id]); // removed on other devices too
    const list = profiles.filter((x) => x.id !== id);
    saveProfiles(list);
    if (id === pid) switchProfile(list[0].id);
  }, [profiles, pid, switchProfile]);

  const resetProfile = useCallback((id: string) => {
    clearData(id, true);
    if (id === pid) setP(load(id));
  }, [pid]);

  const profile = profiles.find((x) => x.id === pid) ?? profiles[0];
  const value = useMemo(
    () => ({ p, set, addWord, bestScore, miss, hit, profiles, profile, switchProfile, addProfile, updateProfile, removeProfile, resetProfile }),
    [p, set, addWord, bestScore, miss, hit, profiles, profile, switchProfile, addProfile, updateProfile, removeProfile, resetProfile],
  );
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const c = useContext(ProgressContext);
  if (!c) throw new Error('useProgress must be used inside ProgressProvider');
  return c;
}

/** Display name for a child; the first child may have no name yet. */
/** A child's name, or "Child 2" in the family's language when no name was given (grown-ups never see Korean). */
export const childName = (pr: Profile, i: number, lang?: LangId) =>
  pr.name.trim() || (lang ? g(lang, 'childN', { n: i + 1 }) : `${i + 1}`);
