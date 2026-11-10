// Guardian account (Supabase Auth, email code) and background sync.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
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
  sync: SyncState;
  sendCode: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  syncNow: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AccountContext = createContext<Ctx | null>(null);

const friendly = (e: unknown) => {
  const m = e instanceof Error ? e.message : String((e as { message?: string })?.message ?? e);
  if (/rate|seconds/i.test(m)) return '잠시 후 다시 시도해 주세요. (코드는 1분에 한 번 보낼 수 있어요)';
  if (/expired|invalid|token/i.test(m)) return '코드가 맞지 않거나 시간이 지났어요. 새 코드를 받아 주세요.';
  if (/fetch|network|Failed/i.test(m)) return '인터넷 연결을 확인해 주세요.';
  return m;
};

export function AccountProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sync, setSync] = useState<SyncState>({ state: supabase ? 'idle' : 'off' });
  const running = useRef(false);
  const again = useRef(false);
  const userId = session?.user.id ?? null;

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
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
    if (!supabase || !userId) { setIsAdmin(false); return; }
    void identifyBuyer(userId);
    supabase.from('admins').select('user_id').eq('user_id', userId).maybeSingle().then(({ data }) => setIsAdmin(!!data));
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
    enabled: !!supabase,
    email: session?.user.email ?? null,
    userId,
    isAdmin,
    sync,
    async sendCode(email) {
      const { error } = await supabase!.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
      if (error) throw new Error(friendly(error));
    },
    async verifyCode(email, code) {
      const { error } = await supabase!.auth.verifyOtp({ email, token: code, type: 'email' });
      if (error) throw new Error(friendly(error));
    },
    syncNow: run,
    async signOut() {
      await supabase!.auth.signOut();
      setSync({ state: 'idle' });
    },
    async deleteAccount() {
      const { error } = await supabase!.rpc('delete_my_account');
      if (error) throw new Error(friendly(error));
      try { localStorage.removeItem('emb-sync-base'); } catch { /* ignore */ }
      await supabase!.auth.signOut();
    },
  }), [session, userId, isAdmin, sync, run]);

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const c = useContext(AccountContext);
  if (!c) throw new Error('useAccount must be used inside AccountProvider');
  return c;
}
