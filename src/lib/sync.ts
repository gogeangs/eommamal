// Two-way sync between this device (localStorage) and the family's account (Supabase).
// Runs as a whole each time (the data is small): pull → merge → push → write back → tell the screens.
//
// Merge rules, against the state both sides had at the last sync ("base"):
//  · collected things only grow: words, phrases, finished books, learning days (union), best stars (max)
//  · settings, reading position and tricky-word counts: the side that changed since the base wins
//  · a child removed on one device is removed everywhere
import { supabase } from './supabase';
import { KEYS, PROGRESS_DEFAULTS, RELOAD_EVENT, load, loadProfiles, prefix, type Profile, type Progress } from './progress';
import { PLAN_KEYS, dayKey } from './plan';

interface Child { id: string; name: string; avatar: string; position: number; progress: Progress }
type Base = { user: string; children: Record<string, Child> };

const BASE_KEY = 'emb-sync-base';
const DELETED_KEY = 'emb-deleted';

const get = <T,>(k: string, f: T): T => { try { const v = localStorage.getItem(k); return v == null ? f : (JSON.parse(v) as T); } catch { return f; } };
// Direct writes: no change event, so a sync never triggers another sync.
const put = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* full */ } };

const LISTS = ['learned', 'written', 'traced', 'sentences', 'finished'] as const;
const MAX_MAPS = ['quizStars', 'dictStars'] as const;
const PICK_MAPS = ['pages', 'misses'] as const;
const SCALARS = ['lang', 'langChosen', 'mode', 'scope', 'dictMode', 'textSize', 'lastOpenedStoryId'] as const;

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const pick = <T,>(base: T, local: T, remote: T) => (same(local, base) ? remote : local);

export function mergeProgress(base: Progress, local: Progress, remote: Progress): Progress {
  const out = { ...PROGRESS_DEFAULTS, ...remote } as Progress;
  for (const k of LISTS) out[k] = [...new Set([...(local[k] ?? []), ...(remote[k] ?? [])])];
  out.days = [...new Set([...(local.days ?? []), ...(remote.days ?? [])])].sort().slice(-120);
  for (const k of MAX_MAPS) {
    const m: Record<string, number> = { ...(remote[k] ?? {}) };
    for (const [id, n] of Object.entries(local[k] ?? {})) m[id] = Math.max(m[id] ?? 0, n);
    out[k] = m;
  }
  for (const k of PICK_MAPS) {
    const m: Record<string, number> = {};
    const ids = new Set([...Object.keys(local[k] ?? {}), ...Object.keys(remote[k] ?? {}), ...Object.keys(base[k] ?? {})]);
    for (const id of ids) {
      const v = pick(base[k]?.[id], local[k]?.[id], remote[k]?.[id]);
      if (typeof v === 'number' && (k === 'pages' || v > 0)) m[id] = v;
    }
    out[k] = m;
  }
  for (const k of SCALARS) (out as unknown as Record<string, unknown>)[k] = pick(base[k], local[k], remote[k]);
  return out;
}

function localChildren(): Child[] {
  return loadProfiles().map((pr: Profile, i: number) => ({ id: pr.id, name: pr.name, avatar: pr.avatar, position: i, progress: load(pr.id) }));
}

function writeLocal(children: Child[]) {
  const list = [...children].sort((a, b) => a.position - b.position);
  put('emb-profiles', list.map(({ id, name, avatar }) => ({ id, name, avatar })));
  for (const c of list) for (const k of KEYS) put(prefix(c.id) + k, c.progress[k]);
  const cur = get<string>('emb-profile', 'p1');
  if (!list.some((c) => c.id === cur) && list[0]) put('emb-profile', list[0].id);
}

export interface SyncResult { at: number; children: number }

export async function syncNow(userId: string): Promise<SyncResult> {
  if (!supabase) throw new Error('서버가 설정되지 않았어요.');
  const db = supabase;
  const today = dayKey();

  // 1. family: the earliest trial start seen anywhere
  const { data: first, error: e1 } = await db.rpc('ensure_family', { local_first: get<string>(PLAN_KEYS.first, today) || today });
  if (e1) throw e1;

  // 2. children
  const { data: rows, error: e2 } = await db.from('children').select('id,name,avatar,position,progress');
  if (e2) throw e2;
  const remote = new Map<string, Child>((rows ?? []).map((r) => [r.id as string, { ...(r as Child), progress: { ...PROGRESS_DEFAULTS, ...(r.progress as Progress) } }]));
  const baseAll = get<Base | null>(BASE_KEY, null);
  const base = baseAll?.user === userId ? baseAll.children : {};
  const deleted = new Set(get<string[]>(DELETED_KEY, []));
  const local = new Map(localChildren().map((c) => [c.id, c]));

  const merged: Child[] = [];
  for (const id of new Set([...local.keys(), ...remote.keys()])) {
    if (deleted.has(id)) continue;
    const l = local.get(id), r = remote.get(id), b = base[id];
    if (l && r) {
      const bp = b?.progress ?? (PROGRESS_DEFAULTS as Progress);
      merged.push({
        id,
        name: pick(b?.name ?? '', l.name, r.name),
        avatar: pick(b?.avatar ?? 'cat', l.avatar, r.avatar),
        position: l.position,
        progress: mergeProgress(bp, l.progress, r.progress),
      });
    } else if (l) {
      // Only here: new on this device — or deleted on another device since the last sync.
      if (b && !r) continue;
      merged.push(l);
    } else if (r) {
      if (b) continue; // removed on this device since the last sync
      merged.push(r);
    }
  }
  if (!merged.length) merged.push(local.get('p1') ?? localChildren()[0]);

  // 3. push what differs from the server
  const upserts = merged.filter((c) => !same(c, remote.get(c.id))).map((c) => ({
    family_id: userId, id: c.id, name: c.name, avatar: c.avatar, position: c.position, progress: c.progress, updated_at: new Date().toISOString(),
  }));
  if (upserts.length) { const { error } = await db.from('children').upsert(upserts); if (error) throw error; }
  const gone = [...remote.keys()].filter((id) => !merged.some((c) => c.id === id));
  if (gone.length) { const { error } = await db.from('children').delete().in('id', gone); if (error) throw error; }

  // 4. today's opened stories (free plan allowance is per family)
  const reads = get<{ day: string; ids: string[] }>(PLAN_KEYS.reads, { day: today, ids: [] });
  const { data: ids, error: e3 } = await db.rpc('mark_reads', { read_day: today, ids: reads.day === today ? reads.ids : [] });
  if (e3) throw e3;

  // 5. subscription bought in the app (also unlocks the web version when signed in)
  const { data: sub } = await db.from('subscriptions').select('active,expires_at').maybeSingle();
  const serverActive = !!sub?.active && (!sub.expires_at || new Date(sub.expires_at) > new Date());
  const localSub = get<{ active: boolean; until?: string }>(PLAN_KEYS.sub, { active: false });
  if (serverActive) put(PLAN_KEYS.sub, { active: true, until: sub?.expires_at ?? undefined });
  else if (localSub.active && localSub.until && new Date(localSub.until) < new Date()) put(PLAN_KEYS.sub, { active: false });

  // 6. write back and remember this state as the next base
  writeLocal(merged);
  put(PLAN_KEYS.first, first ?? today);
  put(PLAN_KEYS.reads, { day: today, ids: (ids as string[] | null) ?? [] });
  put(BASE_KEY, { user: userId, children: Object.fromEntries(merged.map((c) => [c.id, c])) } satisfies Base);
  put(DELETED_KEY, []);
  window.dispatchEvent(new Event(RELOAD_EVENT));
  return { at: Date.now(), children: merged.length };
}
