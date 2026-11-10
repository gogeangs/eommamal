// Where content packs live. Today: a JSON file published with the app, plus drafts and
// previews in this browser. Later a Supabase store can implement the same interface,
// and the admin screen will not need to change.

import { emptyPack, type Pack } from '../content/pack';
import { supabase } from './supabase';
import { dataUrlBytes } from './imageTools';

export interface ContentStore {
  /** The published pack, or null when none is published yet. */
  loadPublished(): Promise<Pack | null>;
  /** The editor's work in progress on this device. */
  loadDraft(): Pack | null;
  saveDraft(pack: Pack): void;
  /** Preview: the app shows this pack instead of the published one on this device. */
  loadPreview(): Pack | null;
  startPreview(pack: Pack): void;
  stopPreview(): void;
}

const DRAFT = 'emb-admin-draft';
const PREVIEW = 'emb-admin-preview';

function readJson(key: string): Pack | null {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as Pack) : null;
  } catch {
    return null;
  }
}

/** Thrown when the browser refuses to store more (usually too many large pictures). */
export class StorageFullError extends Error {}

function writeJson(key: string, pack: Pack) {
  try {
    localStorage.setItem(key, JSON.stringify(pack));
  } catch (e) {
    throw new StorageFullError(String(e));
  }
}

export const fileStore: ContentStore = {
  async loadPublished() {
    // With a server, the pack published from the admin screen wins; the file is the fallback.
    if (supabase) {
      try {
        const { data } = await supabase.from('content_packs').select('pack').eq('id', 'main').maybeSingle();
        const j = data?.pack as Pack | undefined;
        if (j && j.version === 1) return j;
      } catch { /* offline: use the file */ }
    }
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}content/pack.json`, { cache: 'no-cache' });
      if (!res.ok) return null;
      const j = (await res.json()) as Pack;
      return j && j.version === 1 ? j : null;
    } catch {
      return null;
    }
  },
  loadDraft: () => readJson(DRAFT),
  saveDraft: (pack) => writeJson(DRAFT, pack),
  loadPreview: () => readJson(PREVIEW),
  startPreview: (pack) => writeJson(PREVIEW, pack),
  stopPreview: () => {
    try { localStorage.removeItem(PREVIEW); } catch { /* ignore */ }
  },
};

export const contentStore: ContentStore = fileStore;

/** The pack that was published when the app started (the admin screen starts from it). */
export let publishedPack: Pack = emptyPack();
export const setPublishedPack = (p: Pack | null) => { publishedPack = p ?? emptyPack(); };
export const previewActive = () => !!contentStore.loadPreview();

/**
 * Publishes straight to the server (content admins only): pictures go to the 'content' storage bucket,
 * the pack to content_packs. Every device gets it the next time the app starts.
 */
export async function publishToServer(pack: Pack, userId: string, onStep?: (msg: string) => void): Promise<Pack> {
  if (!supabase) throw new Error('서버가 설정되지 않았어요.');
  const db = supabase;
  const out = JSON.parse(JSON.stringify(pack)) as Pack;
  out.updated = new Date().toISOString();
  const refs: { get: () => string | undefined; set: (v: string) => void; name: string }[] = [];
  for (const st of out.stories) st.pages.forEach((p, i) => refs.push({ get: () => p.img, set: (v) => { p.img = v; }, name: `${st.id}-${String(i + 1).padStart(2, '0')}` }));
  for (const w of out.words) refs.push({ get: () => w.img, set: (v) => { w.img = v; }, name: `word-${w.id}` });
  const todo = refs.filter((r) => r.get()?.startsWith('data:'));
  let n = 0;
  for (const r of todo) {
    onStep?.(`그림 올리는 중 ${++n}/${todo.length}`);
    const { bytes, ext } = dataUrlBytes(r.get()!);
    const path = `images/${r.name}-${Date.now().toString(36)}.${ext}`;
    const { error } = await db.storage.from('content').upload(path, bytes, { contentType: `image/${ext}`, upsert: true });
    if (error) throw new Error(`그림을 올리지 못했어요: ${error.message}`);
    r.set(db.storage.from('content').getPublicUrl(path).data.publicUrl);
  }
  onStep?.('내용 저장 중');
  const { error } = await db.from('content_packs').upsert({ id: 'main', pack: out, updated_at: out.updated, updated_by: userId });
  if (error) throw new Error(`게시하지 못했어요: ${error.message}`);
  setPublishedPack(out);
  return out;
}
