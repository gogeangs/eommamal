// Guardian account (Google or an e-mailed sign-in link) and background sync. Server: lib/backend.ts.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { backend, serverReady, type User } from './backend';
import { syncNow } from './sync';
import { CHANGE_EVENT } from './progress';
import { identifyBuyer } from './billing';

export type SyncState = { state: 'off' | 'idle' | 'syncing' | 'error'; at?: number; message?: string };

interface Ctx {
  /** false when the app was built without a server */
  enabled: boolean;
  email: string | null;
  userId: string | null;
  isAdmin: boolean;
  /** languages this account may review (all for admins) */
  reviewLangs: string[];
  sync: SyncState;
  signInWithGoogle: () => Promise<void>;
  /** e-mails a sign-in link; the parent taps it to come back signed in */
  sendLink: (email: string) => Promise<void>;
  syncNow: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AccountContext = createContext<Ctx | null>(null);

const friendly = (e: unknown) => {
  const m = e instanceof Error ? e.message : String((e as { message?: string })?.message ?? e);
  if (/too-many-requests|quota/i.test(m)) return '잠시 후 다시 시도해 주세요.';
  if (/invalid-action-code|expired/i.test(m)) return '로그인 링크가 만료됐거나 이미 쓰였어요. 새 링크를 받아 주세요.';
  if (/invalid-email/i.test(m)) return '이메일 주소를 확인해 주세요.';
  if (/popup-closed|cancelled/i.test(m)) return '로그인을 취소했어요.';
  if (/unauthorized-domain/i.test(m)) return '이 주소에서는 로그인이 아직 허용되지 않았어요. (Firebase 승인된 도메인 설정 필요)';
  if (/network|fetch|Failed|unavailable/i.test(m)) return '인터넷 연결을 확인해 주세요.';
  return m;
};

export function AccountProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reviewLangs, setReviewLangs] = useState<string[]>([]);
  const [sync, setSync] = useState<SyncState>({ state: serverReady() ? 'idle' : 'off' });
  const running = useRef(false);
  const again = useRef(false);
  const userId = user?.uid ?? null;

  useEffect(() => {
    const p = backend();
    if (!p) return;
    let off = () => {};
    let alive = true;
    p.then(async (be) => {
      if (!alive) return;
      off = be.onAuth(setUser);
      // Opened from the e-mailed sign-in link: finish signing in.
      try { await be.completeSignInLink(); } catch (e) { setSync({ state: 'error', message: friendly(e) }); }
    }).catch(() => setSync({ state: 'error', message: '서버에 연결하지 못했어요.' }));
    return () => { alive = false; off(); };
  }, []);

  const run = useCallback(async () => {
    if (!userId) return;
    if (running.current) { again.current = true; return; }
    running.current = true;
    setSync((s) => ({ ...s, state: 'syncing' }));
    try {
      const r = await syncNow(userId);
      setSync({ state: 'idle', at: r.at });
    } catch (e) {
      setSync({ state: 'error', message: friendly(e) });
    }
    running.current = false;
    if (again.current) { again.current = false; void run(); }
  }, [userId]);

  // On sign-in: link store purchases to the family, check admin rights, sync.
  useEffect(() => {
    const p = backend();
    if (!p || !userId) { setIsAdmin(false); setReviewLangs([]); return; }
    void identifyBuyer(userId);
    p.then((be) => { be.isAdmin(userId).then(setIsAdmin); be.reviewLangs(userId).then(setReviewLangs); });
    void run();
  }, [userId, run]);

  // Upload changes a few seconds after the child stops tapping; catch up when the app comes back.
  useEffect(() => {
    if (!userId) return;
    let t = 0;
    const later = () => { clearTimeout(t); t = window.setTimeout(() => void run(), 3000); };
    const now = () => { if (document.visibilityState === 'visible') void run(); };
    window.addEventListener(CHANGE_EVENT, later);
    window.addEventListener('online', now);
    document.addEventListener('visibilitychange', now);
    return () => {
      clearTimeout(t);
      window.removeEventListener(CHANGE_EVENT, later);
      window.removeEventListener('online', now);
      document.removeEventListener('visibilitychange', now);
    };
  }, [userId, run]);

  const value = useMemo<Ctx>(() => ({
    enabled: serverReady(),
    email: user ? user.email ?? '(Google)' : null,
    userId,
    isAdmin,
    reviewLangs: isAdmin ? ['ru', 'mn', 'vi', 'uz', 'zh', 'en'] : reviewLangs,
    sync,
    async signInWithGoogle() {
      try { await (await backend()!).signInWithGoogle(); } catch (e) { throw new Error(friendly(e)); }
    },
    async sendLink(email) {
      try { await (await backend()!).sendSignInLink(email); } catch (e) { throw new Error(friendly(e)); }
    },
    syncNow: run,
    async signOut() {
      await (await backend()!).signOut();
      setSync({ state: 'idle' });
    },
    async deleteAccount() {
      try { await (await backend()!).deleteAccount(); } catch (e) { throw new Error(friendly(e)); }
      try { localStorage.removeItem('emb-sync-base'); } catch { /* ignore */ }
    },
  }), [user, userId, isAdmin, reviewLangs, sync, run]);

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const c = useContext(AccountContext);
  if (!c) throw new Error('useAccount must be used inside AccountProvider');
  return c;
}
