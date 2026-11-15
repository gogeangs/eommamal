// Where content packs live. Today: a JSON file published with the app, plus drafts and
// previews in this browser. With a server (Firebase) the published pack comes from there,
// and the admin screen will not need to change.

import { emptyPack, type Pack, type ReviewMark } from '../content/pack';
import type { LangId } from '../content/types';
import { backend } from './backend';

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
    const be = backend();
    if (be) {
      try {
        const j = await Promise.race([be.then((x) => x.loadContent()), new Promise<null>((r) => setTimeout(() => r(null), 4000))]);
        if (j) return j;
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
 * Publishes straight to the server (content admins). Pictures are not uploaded: the free server plan has no file
 * storage, so a pack with new pictures goes out as a file (content.zip → GitHub) instead.
 */
export async function publishToServer(pack: Pack, userId: string, onStep?: (msg: string) => void): Promise<Pack> {
  const p = backend();
  if (!p) throw new Error('서버가 설정되지 않았어요.');
  const out = JSON.parse(JSON.stringify(pack)) as Pack;
  out.updated = new Date().toISOString();
  const hasNewPictures = out.stories.some((s) => s.pages.some((pg) => pg.img?.startsWith('data:'))) || out.words.some((w) => w.img?.startsWith('data:'));
  if (hasNewPictures) throw new Error('새 그림이 들어 있어서 서버에 바로 올릴 수 없어요. 아래 "콘텐츠 파일 내려받기"로 게시해 주세요. (글만 바꾼 경우는 서버 게시가 돼요)');
  if (JSON.stringify(out).length > 900_000) throw new Error('내용이 너무 커서 서버에 올릴 수 없어요. 파일로 게시해 주세요.');
  onStep?.('내용 저장 중');
  await (await p).publishContent(out, userId);
  setPublishedPack(out);
  return out;
}

/** Saves one language's translation corrections and review marks to the server (reviewers and admins). */
export async function saveReviewToServer(lang: LangId, texts: Record<string, string | null>, marks: Record<string, ReviewMark | null>) {
  const p = backend();
  if (!p) throw new Error('서버가 설정되지 않았어요.');
  try { await (await p).saveReview(lang, texts, marks); }
  catch (e) {
    const m = e instanceof Error ? e.message : String(e);
    throw new Error(/permission/i.test(m) ? '이 언어의 검수 권한이 없어요.' : m);
  }
}
