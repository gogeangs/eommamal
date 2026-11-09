// Where content packs live. Today: a JSON file published with the app, plus drafts and
// previews in this browser. Later a Supabase store can implement the same interface,
// and the admin screen will not need to change.

import { emptyPack, type Pack } from '../content/pack';

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
