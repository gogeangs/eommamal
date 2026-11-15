// The app's server, behind one small interface. Today: Firebase (free Spark plan: Auth + Firestore).
// Without the VITE_FIREBASE_* settings the app runs on this device only — exactly as before — and the
// Firebase SDK is never downloaded (it is loaded on demand, only when configured).
import type { Pack, ReviewMark } from '../content/pack';
import type { LangId } from '../content/types';
import type { Progress } from './progress';

export interface ChildRow { id: string; name: string; avatar: string; position: number; progress: Progress }
export interface User { uid: string; email: string | null }

export interface Backend {
  onAuth(cb: (u: User | null) => void): () => void;
  signInWithGoogle(): Promise<void>;
  /** e-mails a one-tap sign-in link that opens the app again */
  sendSignInLink(email: string): Promise<void>;
  /** finishes a sign-in when the app was opened from that link; true if it did */
  completeSignInLink(): Promise<boolean>;
  signOut(): Promise<void>;
  /** deletes the family's server data and the account */
  deleteAccount(): Promise<void>;

  isAdmin(uid: string): Promise<boolean>;
  reviewLangs(uid: string): Promise<string[]>;

  /** creates the family if needed and returns the earliest trial start ever seen */
  ensureFamily(uid: string, localFirst: string): Promise<string>;
  getChildren(uid: string): Promise<ChildRow[]>;
  putChildren(uid: string, rows: ChildRow[]): Promise<void>;
  deleteChildren(uid: string, ids: string[]): Promise<void>;
  /** adds story ids to the day's list and returns the whole list */
  markReads(uid: string, day: string, ids: string[]): Promise<string[]>;
  getSubscription(uid: string): Promise<{ active: boolean; until?: string } | null>;

  loadContent(): Promise<Pack | null>;
  /** whole-pack publish (admins); keeps translation fixes reviewers saved meanwhile */
  publishContent(pack: Pack, uid: string): Promise<void>;
  /** merges one language's corrections and marks key by key (reviewers of that language, admins) */
  saveReview(lang: LangId, texts: Record<string, string | null>, marks: Record<string, ReviewMark | null>): Promise<void>;
}

const env = import.meta.env;
export const firebaseConfig = env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID
  ? {
      apiKey: env.VITE_FIREBASE_API_KEY as string,
      authDomain: (env.VITE_FIREBASE_AUTH_DOMAIN as string) || `${env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: env.VITE_FIREBASE_PROJECT_ID as string,
      appId: (env.VITE_FIREBASE_APP_ID as string) || undefined,
    }
  : null;

/** Automated tests can put an in-memory server here before the app starts. */
const testDouble = (): Backend | undefined => (globalThis as { __embTestBackend?: Backend }).__embTestBackend;

/** true when the app was built with a server */
export const serverReady = () => !!firebaseConfig || !!testDouble();

let loading: Promise<Backend> | null = null;
/** The server, loaded on first use; null when the app has none. */
export function backend(): Promise<Backend> | null {
  const t = testDouble();
  if (t) return (loading ??= Promise.resolve(t));
  if (!firebaseConfig) return null;
  loading ??= import('./firebaseBackend').then((m) => m.create(firebaseConfig!));
  return loading;
}
