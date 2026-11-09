// Free trial, daily reading allowance and the family subscription.
//  · Days 1–30 from the first use on this device: everything is open.
//  · From day 31 without a subscription: 2 stories a day (re-opening a story already read today is free).
//    Word games, tracing and dictation stay open.
//  · Family subscription (₩4,900 / month, in-app): everything, for every child on the device.
// Kept for the whole family on this device, not per child, so adding a child does not add stories.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { store, type SubStatus } from './billing';

export const TRIAL_DAYS = 30;
export const DAILY_STORIES = 2;

const K = { first: 'emb-firstUse', reads: 'emb-reads', sub: 'emb-sub' };

function read<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v == null ? fallback : (JSON.parse(v) as T); } catch { return fallback; }
}
function write(key: string, v: unknown) { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* memory only */ } }

export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dayNumber = (key: string) => { const [y, m, d] = key.split('-').map(Number); return Math.round(Date.UTC(y, m - 1, d) / 86400000); };

/** Test hook: ?plan=trial|free|sub on the URL forces a state on this device (not shown in the UI). */
function forced(): 'trial' | 'free' | 'sub' | null {
  const v = new URLSearchParams(location.search).get('plan');
  return v === 'trial' || v === 'free' || v === 'sub' ? v : null;
}

export type PlanState = 'trial' | 'free' | 'sub';

interface Ctx {
  state: PlanState;
  /** days of trial left including today (trial only) */
  trialLeft: number;
  /** stories that can still be newly opened today (free only) */
  todayLeft: number;
  canRead: (storyId: string) => boolean;
  /** records that a story was opened today */
  markRead: (storyId: string) => void;
  sub: SubStatus;
  native: boolean;
  price: string;
  subscribe: () => Promise<void>;
  restore: () => Promise<void>;
}

const PlanContext = createContext<Ctx | null>(null);

export function PlanProvider({ children }: { children: ReactNode }) {
  const today = dayKey();
  const [first] = useState<string>(() => {
    const f = read<string>(K.first, '');
    if (f) return f;
    write(K.first, today);
    return today;
  });
  const [reads, setReads] = useState<{ day: string; ids: string[] }>(() => {
    const r = read(K.reads, { day: today, ids: [] as string[] });
    return r.day === today ? r : { day: today, ids: [] };
  });
  const [sub, setSub] = useState<SubStatus>(() => {
    const s = read<SubStatus>(K.sub, { active: false });
    return s.active && s.until && new Date(s.until) < new Date() ? { active: false } : s;
  });
  const [price, setPrice] = useState('₩4,900');
  const st = useMemo(store, []);

  const saveSub = (s: SubStatus) => { write(K.sub, s); setSub(s); };

  // The store is the source of truth inside the app; check it once at start.
  useEffect(() => {
    if (!st.native) return;
    st.status().then(saveSub).catch(() => { /* offline: keep the cached state */ });
    st.price().then(setPrice).catch(() => {});
  }, [st]);

  const f = forced();
  const dayIndex = dayNumber(today) - dayNumber(first); // 0 on the first day
  const state: PlanState = f ?? (sub.active ? 'sub' : dayIndex < TRIAL_DAYS ? 'trial' : 'free');
  const trialLeft = Math.max(0, TRIAL_DAYS - dayIndex);
  const todayIds = reads.day === today ? reads.ids : [];
  const todayLeft = Math.max(0, DAILY_STORIES - todayIds.length);

  const canRead = useCallback((id: string) => state !== 'free' || todayIds.includes(id) || todayIds.length < DAILY_STORIES, [state, todayIds]);

  const markRead = useCallback((id: string) => {
    setReads((prev) => {
      const base = prev.day === today ? prev : { day: today, ids: [] };
      if (base.ids.includes(id)) return base;
      const next = { day: today, ids: [...base.ids, id] };
      write(K.reads, next);
      return next;
    });
  }, [today]);

  const subscribe = useCallback(async () => { saveSub(await st.purchase()); }, [st]);
  const restore = useCallback(async () => { saveSub(await st.restore()); }, [st]);

  const value = useMemo(
    () => ({ state, trialLeft, todayLeft, canRead, markRead, sub, native: st.native, price, subscribe, restore }),
    [state, trialLeft, todayLeft, canRead, markRead, sub, st.native, price, subscribe, restore],
  );
  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan() {
  const c = useContext(PlanContext);
  if (!c) throw new Error('usePlan must be used inside PlanProvider');
  return c;
}
