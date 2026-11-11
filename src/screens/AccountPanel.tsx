import { useState } from 'react';
import { useAccount } from '../lib/account';
import { useProgress } from '../lib/progress';
import { pt } from '../lib/parentUi';
import { g, LOCALE } from '../lib/grownUi';
import type { LangId } from '../content';

const ago = (lang: LangId, t?: number) => {
  if (!t) return '';
  const s = Math.round((Date.now() - t) / 1000);
  return s < 60 ? g(lang, 'justNow') : s < 3600 ? g(lang, 'minAgo', { n: Math.round(s / 60) }) : new Date(t).toLocaleString(LOCALE[lang]);
};

/** Sign in with an email code, see sync state, sign out or delete the account. Hidden when no server is set up. */
export function AccountPanel({ compact = false }: { compact?: boolean }) {
  const acc = useAccount();
  const { p } = useProgress();
  const L = p.lang;
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [confirm, setConfirm] = useState(false);
  if (!acc.enabled) return null;

  const run = async (fn: () => Promise<void>) => {
    setBusy(true); setMsg('');
    try { await fn(); } catch (e) { setMsg(e instanceof Error ? e.message : String(e)); }
    setBusy(false);
  };

  const head = !compact && (
    <>
      <h2 className="ph"><span lang={p.lang}>{pt(p.lang, 'account')}</span></h2>
      <p className="ptip" lang={p.lang}>{pt(p.lang, 'accountWhy')}</p>
    </>
  );

  if (acc.email) {
    const s = acc.sync;
    return (
      <section className="pcard stack account" lang={L}>
        {head}
        <p className="acc-who"><b>{acc.email}</b>{acc.isAdmin && <em className="badge-ok">{g(L, 'admin')}</em>}</p>
        <p className={`acc-sync ${s.state}`} role="status">
          {s.state === 'syncing' ? g(L, 'syncing') : s.state === 'error' ? g(L, 'syncFail', { m: s.message ?? '' }) : s.at ? g(L, 'synced', { t: ago(L, s.at) }) : g(L, 'signedIn')}
        </p>
        <div className="prow">
          <button className="btn2" disabled={s.state === 'syncing'} onClick={() => void acc.syncNow()}>{g(L, 'syncNow')}</button>
          <button className="btn2" onClick={() => void run(acc.signOut)}>{g(L, 'signOut')}</button>
        </div>
        {!compact && (confirm ? (
          <div className="confirm" role="alertdialog" aria-labelledby="del-t">
            <p id="del-t">{g(L, 'confirmDelAcc')}</p>
            <div className="prow">
              <button className="btn2" onClick={() => setConfirm(false)}>{g(L, 'cancel')}</button>
              <button className="play danger" disabled={busy} onClick={() => void run(async () => { await acc.deleteAccount(); setConfirm(false); })}>{g(L, 'delAcc')}</button>
            </div>
          </div>
        ) : (
          <button className="ghost danger" onClick={() => setConfirm(true)}>{g(L, 'delAccOf')}</button>
        ))}
        {msg && <p className="pnote" role="alert">{msg}</p>}
      </section>
    );
  }

  return (
    <section className="pcard stack account" lang={L}>
      {head}
      {step === 'email' ? (
        <form className="stack" onSubmit={(e) => { e.preventDefault(); if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setMsg(g(L, 'badEmail')); return; } void run(async () => { await acc.sendCode(email.trim()); setStep('code'); }); }}>
          <div className="field">
            <label htmlFor="acc-email">{g(L, 'email')}</label>
            <input id="acc-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="parent@example.com" />
            <small>{g(L, 'emailTip')}</small>
          </div>
          <button className="play" disabled={busy}>{busy ? g(L, 'sending') : g(L, 'getCode')}</button>
        </form>
      ) : (
        <form className="stack" onSubmit={(e) => { e.preventDefault(); void run(() => acc.verifyCode(email.trim(), code.trim())); }}>
          <div className="field">
            <label htmlFor="acc-code">{g(L, 'codeSent', { email })}</label>
            <input id="acc-code" inputMode="numeric" autoComplete="one-time-code" maxLength={8} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="123456" />
            <small>{g(L, 'spam')}</small>
          </div>
          <div className="prow">
            <button type="button" className="btn2" onClick={() => { setStep('email'); setCode(''); setMsg(''); }}>{g(L, 'changeEmail')}</button>
            <button className="play" disabled={busy || code.length < 6}>{busy ? g(L, 'checking') : g(L, 'signIn')}</button>
          </div>
        </form>
      )}
      {msg && <p className="pnote" role="alert">{msg}</p>}
    </section>
  );
}
