import { useState } from 'react';
import { useAccount } from '../lib/account';
import { useProgress } from '../lib/progress';
import { KO, pt } from '../lib/parentUi';

const ago = (t?: number) => {
  if (!t) return '';
  const s = Math.round((Date.now() - t) / 1000);
  return s < 60 ? '방금' : s < 3600 ? `${Math.round(s / 60)}분 전` : new Date(t).toLocaleString('ko-KR');
};

/** Sign in with an email code, see sync state, sign out or delete the account. Hidden when no server is set up. */
export function AccountPanel({ compact = false }: { compact?: boolean }) {
  const acc = useAccount();
  const { p } = useProgress();
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
      <h2 className="ph"><span lang={p.lang}>{pt(p.lang, 'account')}</span><small>{KO.account}</small></h2>
      <p className="ptip" lang={p.lang}>{pt(p.lang, 'accountWhy')}</p>
      <p className="pnote">{KO.accountWhy}</p>
    </>
  );

  if (acc.email) {
    const s = acc.sync;
    return (
      <section className="pcard stack account">
        {head}
        <p className="acc-who"><b>{acc.email}</b>{acc.isAdmin && <em className="badge-ok">콘텐츠 관리자</em>}</p>
        <p className={`acc-sync ${s.state}`} role="status">
          {s.state === 'syncing' ? '기록을 맞추는 중…' : s.state === 'error' ? `동기화하지 못했어요: ${s.message}` : s.at ? `기록 저장됨 · ${ago(s.at)}` : '로그인됨'}
        </p>
        <div className="prow">
          <button className="btn2" disabled={s.state === 'syncing'} onClick={() => void acc.syncNow()}>지금 맞추기</button>
          <button className="btn2" onClick={() => void run(acc.signOut)}>로그아웃</button>
        </div>
        {!compact && (confirm ? (
          <div className="confirm" role="alertdialog" aria-labelledby="del-t">
            <p id="del-t">보호자 계정과 서버에 저장된 아이들 기록을 모두 지울까요? 되돌릴 수 없어요. 이 기기의 기록은 남아요. 앱에서 산 구독은 App Store·Google Play에서 따로 해지해 주세요.</p>
            <div className="prow">
              <button className="btn2" onClick={() => setConfirm(false)}>취소</button>
              <button className="play danger" disabled={busy} onClick={() => void run(async () => { await acc.deleteAccount(); setConfirm(false); })}>계정 지우기</button>
            </div>
          </div>
        ) : (
          <button className="ghost danger" onClick={() => setConfirm(true)}>보호자 계정 지우기</button>
        ))}
        {msg && <p className="pnote" role="alert">{msg}</p>}
      </section>
    );
  }

  return (
    <section className="pcard stack account">
      {head}
      {step === 'email' ? (
        <form className="stack" onSubmit={(e) => { e.preventDefault(); if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setMsg('이메일 주소를 확인해 주세요.'); return; } void run(async () => { await acc.sendCode(email.trim()); setStep('code'); }); }}>
          <div className="field">
            <label htmlFor="acc-email">보호자 이메일</label>
            <input id="acc-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="parent@example.com" />
            <small>비밀번호 없이, 이메일로 받은 6자리 코드로 로그인해요. 처음이면 계정이 만들어져요.</small>
          </div>
          <button className="play" disabled={busy}>{busy ? '보내는 중…' : '로그인 코드 받기'}</button>
        </form>
      ) : (
        <form className="stack" onSubmit={(e) => { e.preventDefault(); void run(() => acc.verifyCode(email.trim(), code.trim())); }}>
          <div className="field">
            <label htmlFor="acc-code">{email}로 보낸 코드</label>
            <input id="acc-code" inputMode="numeric" autoComplete="one-time-code" maxLength={8} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="123456" />
            <small>메일이 안 보이면 스팸함도 확인해 주세요.</small>
          </div>
          <div className="prow">
            <button type="button" className="btn2" onClick={() => { setStep('email'); setCode(''); setMsg(''); }}>이메일 바꾸기</button>
            <button className="play" disabled={busy || code.length < 6}>{busy ? '확인 중…' : '로그인'}</button>
          </div>
        </form>
      )}
      {msg && <p className="pnote" role="alert">{msg}</p>}
    </section>
  );
}
