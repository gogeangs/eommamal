// Translation review: a native speaker reads every text of one language next to the Korean original,
// fixes typos and marks each line as checked. Corrections apply live on this device as a preview and are
// saved to the server (reviewers and admins), or handed over as a file when there is no server.
import { useEffect, useMemo, useState } from 'react';
import { LANGS, type LangId } from '../content';
import { GROUPS, entries, koOf, placeholders, shippedText, type Entry, type Group } from '../content/i18n';
import { LANG_IDS, type Pack, type ReviewMark } from '../content/pack';
import { contentStore, publishedPack, saveReviewToServer, setPublishedPack } from '../lib/contentStore';
import { useAccount } from '../lib/account';
import { AccountPanel } from './AccountPanel';
import { useNav } from '../nav';

type Draft = { text: Partial<Record<LangId, Record<string, string | null>>>; review: Partial<Record<LangId, Record<string, ReviewMark | null>>> };
const DRAFT_KEY = 'emb-review-draft';
const NAME_KEY = 'emb-reviewer-name';
const LANG_KEY = 'emb-review-lang';

const load = <T,>(k: string, f: T): T => { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : f; } catch { return f; } };
const save = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* full */ } };

type Filter = 'all' | 'todo' | 'ok' | 'fixed' | 'flag';
const FILTERS: { id: Filter; ko: string; en: string }[] = [
  { id: 'all', ko: '전체', en: 'All' },
  { id: 'todo', ko: '검수 전', en: 'To check' },
  { id: 'fixed', ko: '고침', en: 'Fixed' },
  { id: 'flag', ko: '다시 볼 것', en: 'Flagged' },
  { id: 'ok', ko: '확인함', en: 'OK' },
];

function download(name: string, text: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

export function Review() {
  const nav = useNav();
  const acc = useAccount();
  const [lang, setLang] = useState<LangId>(() => load<LangId>(LANG_KEY, 'vi'));
  const [group, setGroup] = useState<Group>('story');
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const [name, setName] = useState(() => load<string>(NAME_KEY, ''));
  const [draft, setDraft] = useState<Draft>(() => load<Draft>(DRAFT_KEY, { text: {}, review: {} }));
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [, bump] = useState(0);

  useEffect(() => save(DRAFT_KEY, draft), [draft]);
  useEffect(() => save(NAME_KEY, name), [name]);
  useEffect(() => save(LANG_KEY, lang), [lang]);

  const all = useMemo(() => entries(), []);
  const dText = draft.text[lang] ?? {};
  const dMarks = draft.review[lang] ?? {};
  const pubMarks = publishedPack.review?.[lang] ?? {};
  const mark = (k: string): ReviewMark | undefined => (k in dMarks ? dMarks[k] ?? undefined : pubMarks[k]);
  const pending = Object.keys(dText).length + Object.keys(dMarks).length;

  const counts = useMemo(() => {
    let done = 0, flag = 0;
    for (const e of all) { const m = mark(e.key); if (m) { done++; if (m.s === 'flag') flag++; } }
    return { done, flag, total: all.length };
  }, [all, draft, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = all.filter((e) => {
    if (e.group !== group) return false;
    const m = mark(e.key);
    if (filter === 'todo' && m) return false;
    if (filter !== 'all' && filter !== 'todo' && m?.s !== filter) return false;
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      return [e.where, e.get(lang), koOf(e, lang), e.en ?? ''].some((x) => x.toLowerCase().includes(s));
    }
    return true;
  });

  const now = () => new Date().toISOString();
  const by = () => name.trim() || acc.email || undefined;
  const setText = (e: Entry, v: string) => {
    e.set(lang, v); // live preview on this device
    const orig = shippedText(e.key, lang);
    setDraft((d) => ({
      text: { ...d.text, [lang]: { ...(d.text[lang] ?? {}), [e.key]: v === orig ? null : v } },
      review: { ...d.review, [lang]: { ...(d.review[lang] ?? {}), [e.key]: { s: 'fixed', by: by(), at: now() } } },
    }));
  };
  const setMark = (e: Entry, m: ReviewMark | null) =>
    setDraft((d) => ({ ...d, review: { ...d.review, [lang]: { ...(d.review[lang] ?? {}), [e.key]: m } } }));
  const revert = (e: Entry) => {
    const orig = shippedText(e.key, lang);
    if (orig == null) return;
    e.set(lang, orig);
    setDraft((d) => ({ ...d, text: { ...d.text, [lang]: { ...(d.text[lang] ?? {}), [e.key]: null } } }));
    bump((n) => n + 1);
  };

  const clearLang = () => setDraft((d) => {
    const t = { ...d.text }; const r = { ...d.review }; delete t[lang]; delete r[lang];
    return { text: t, review: r };
  });

  /** Keeps what was saved in this session's idea of the published pack, so marks show as saved. */
  const absorb = () => {
    const p: Pack = JSON.parse(JSON.stringify(publishedPack));
    p.text = { ...(p.text ?? {}) }; p.review = { ...(p.review ?? {}) };
    const t = { ...(p.text[lang] ?? {}) }; const r = { ...(p.review[lang] ?? {}) };
    for (const [k, v] of Object.entries(dText)) { if (v == null) delete t[k]; else t[k] = v; }
    for (const [k, v] of Object.entries(dMarks)) { if (v == null) delete r[k]; else r[k] = v; }
    p.text[lang] = t; p.review[lang] = r;
    setPublishedPack(p);
  };

  const saveServer = async () => {
    setBusy(true); setNotice('');
    try {
      await saveReviewToServer(lang, dText, dMarks);
      absorb(); clearLang();
      setNotice('서버에 저장했어요. 앱을 다시 열면 모든 기기에 반영돼요. · Saved.');
    } catch (err) { setNotice(err instanceof Error ? err.message : String(err)); }
    setBusy(false);
  };

  const toAdminDraft = () => {
    const p: Pack = contentStore.loadDraft() ?? JSON.parse(JSON.stringify(publishedPack));
    p.text = { ...(p.text ?? {}) }; p.review = { ...(p.review ?? {}) };
    const t = { ...(p.text[lang] ?? {}) }; const r = { ...(p.review[lang] ?? {}) };
    for (const [k, v] of Object.entries(dText)) { if (v == null) delete t[k]; else t[k] = v; }
    for (const [k, v] of Object.entries(dMarks)) { if (v == null) delete r[k]; else r[k] = v; }
    p.text[lang] = t; p.review[lang] = r;
    contentStore.saveDraft(p);
    absorb(); clearLang();
    setNotice('관리 화면 작업 내용에 넣었어요. 관리 화면 → 내려받기·게시에서 게시해 주세요.');
  };

  const exportFile = () => {
    download(`review-${lang}-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify({ kind: 'eommamal-review', lang, by: by(), at: now(), text: dText, review: dMarks }, null, 1));
    setNotice('파일을 내려받았어요. 이 파일을 운영자(biz@project30s.co.kr)에게 보내 주세요. · File downloaded — send it to the team.');
  };

  const importFile = async (f: File) => {
    try {
      const j = JSON.parse(await f.text()) as { kind?: string; lang: LangId; text?: Record<string, string | null>; review?: Record<string, ReviewMark | null> };
      if (j.kind !== 'eommamal-review' || !LANG_IDS.includes(j.lang)) throw new Error('검수 파일이 아니에요.');
      const byKey = new Map(all.map((e) => [e.key, e]));
      for (const [k, v] of Object.entries(j.text ?? {})) { const e = byKey.get(k); if (e) e.set(j.lang, v ?? shippedText(k, j.lang) ?? e.get(j.lang)); }
      setDraft((d) => ({
        text: { ...d.text, [j.lang]: { ...(d.text[j.lang] ?? {}), ...(j.text ?? {}) } },
        review: { ...d.review, [j.lang]: { ...(d.review[j.lang] ?? {}), ...(j.review ?? {}) } },
      }));
      setLang(j.lang);
      setNotice(`${LANGS.find((l) => l.id === j.lang)?.ko} 검수 파일을 불러왔어요.`);
    } catch (err) { setNotice(err instanceof Error ? err.message : String(err)); }
  };

  const canServer = acc.enabled && !!acc.email && acc.reviewLangs.includes(lang);
  const langName = LANGS.find((l) => l.id === lang)!;

  return (
    <div className="admin review">
      <div className="top">
        <button className="ghost back" onClick={() => nav({ view: 'admin' })}>‹ 관리 화면</button>
        <button className="btn2 small" onClick={() => nav({ view: 'home' })}>앱에서 보기 · Preview</button>
      </div>
      <header>
        <h1>번역 검수 <small>Translation review</small></h1>
        <p className="lead">한국어 원문과 비교해 오타를 고치고, 확인한 줄은 ✓를 눌러 주세요. 고친 글은 이 기기에서 바로 앱에 보여요.<br />
          <span lang="en">Compare with the Korean original, fix typos, and tap ✓ for lines that are correct. Fixes show in the app on this device right away.</span></p>
      </header>

      <section className="admin-card stack">
        <div className="chips" role="group" aria-label="언어">
          {LANG_IDS.map((l) => {
            const L = LANGS.find((x) => x.id === l)!;
            return <button key={l} className="chip" aria-pressed={l === lang} onClick={() => setLang(l)}><span lang={l}>{L.name}</span><small>{L.ko}</small></button>;
          })}
        </div>
        <div className="review-progress">
          <b>{counts.done} / {counts.total}</b> 검수함 · reviewed{counts.flag ? ` · ⚑ ${counts.flag}` : ''}
          <div className="mini-bar"><i style={{ width: `${(counts.done / Math.max(1, counts.total)) * 100}%` }} /></div>
        </div>
        <label className="field" htmlFor="rv-name"><span className="label">검수자 이름 · Your name</span>
          <input id="rv-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: Nguyen Lan" /></label>
      </section>

      <nav className="admin-tabs" aria-label="종류">
        {GROUPS.map((g) => (
          <button key={g.id} aria-current={g.id === group ? 'page' : undefined} onClick={() => setGroup(g.id)}>{g.ko} <small>{g.en}</small></button>
        ))}
      </nav>
      <div className="review-tools">
        <div className="chips" role="group" aria-label="상태">
          {FILTERS.map((f) => <button key={f.id} className="chip" aria-pressed={f.id === filter} onClick={() => setFilter(f.id)}>{f.ko}<small>{f.en}</small></button>)}
        </div>
        <input className="review-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="찾기 · Search" aria-label="찾기" />
      </div>

      <ol className="review-list">
        {shown.map((e) => {
          const cur = e.get(lang);
          const m = mark(e.key);
          const ko = koOf(e, lang);
          const orig = shippedText(e.key, lang);
          const ph = e.en ? placeholders(e.en) : '';
          const badPh = ph !== '' && placeholders(cur) !== ph;
          return (
            <li key={e.key} className={`review-item${m ? ` is-${m.s}` : ''}`}>
              <p className="review-where">{e.where} <code>{e.key}</code></p>
              {ko && <p className="review-ko" lang="ko"><span>한국어</span>{ko}</p>}
              {lang !== 'en' && e.en && <p className="review-en" lang="en"><span>English</span>{e.en}</p>}
              <label className="sr-only" htmlFor={`rv-${e.key}`}>{langName.name}</label>
              <textarea id={`rv-${e.key}`} lang={lang} rows={Math.min(6, Math.max(1, Math.ceil(cur.length / 38)))} value={cur}
                onChange={(ev) => setText(e, ev.target.value)} />
              {badPh && <p className="form-error">{ph} 표시는 그대로 두어야 해요 · Keep {ph} as is.</p>}
              {m?.s === 'flag' && (
                <input className="review-note" value={m.note ?? ''} placeholder="무엇이 문제인가요? · What needs another look?"
                  onChange={(ev) => setMark(e, { ...m, note: ev.target.value })} />
              )}
              <div className="review-actions">
                <button className={`chip${m?.s === 'ok' ? ' on' : ''}`} aria-pressed={m?.s === 'ok'} onClick={() => setMark(e, m?.s === 'ok' ? null : { s: 'ok', by: by(), at: now() })}>✓ 확인 <small>OK</small></button>
                <button className={`chip${m?.s === 'flag' ? ' on' : ''}`} aria-pressed={m?.s === 'flag'} onClick={() => setMark(e, m?.s === 'flag' ? null : { s: 'flag', by: by(), at: now() })}>⚑ 다시 보기 <small>Flag</small></button>
                {orig != null && cur !== orig && <button className="ghost" onClick={() => revert(e)}>원래 글로 · Revert</button>}
                {m?.s === 'fixed' && <span className="badge-ok">고침 · fixed</span>}
                {m?.by && <small className="review-by">{m.by}</small>}
              </div>
            </li>
          );
        })}
        {!shown.length && <li className="admin-note">해당하는 글이 없어요 · Nothing here.</li>}
      </ol>

      <section className="admin-card stack review-save">
        <p className="k"><b>저장하지 않은 변경 {pending}개</b> · {pending} unsaved</p>
        {canServer ? (
          <button className="play" disabled={busy || !pending} onClick={saveServer}>{busy ? '저장 중…' : `서버에 저장 · Save (${langName.ko})`}</button>
        ) : acc.enabled && !acc.email ? (
          <div className="stack"><p className="k">검수자 계정으로 로그인하면 서버에 바로 저장돼요. · Sign in to save.</p><AccountPanel compact /></div>
        ) : acc.enabled && acc.email ? (
          <p className="admin-note">{acc.email} 계정은 {langName.ko} 검수 권한이 없어요. 아래 파일로 보내 주세요.</p>
        ) : null}
        <button className="btn2" disabled={!pending} onClick={exportFile}>검수 파일 내려받기 · Download my review</button>
        {acc.isAdmin || !acc.enabled ? (
          <>
            <label className="btn2 file-btn">검수 파일 불러오기 · Load a review file
              <input type="file" accept=".json" onChange={(ev) => { const f = ev.target.files?.[0]; if (f) void importFile(f); ev.target.value = ''; }} />
            </label>
            {!canServer && <button className="btn2" disabled={!pending} onClick={toAdminDraft}>관리 화면 작업 내용에 넣기 (파일 게시용)</button>}
          </>
        ) : null}
        {notice && <p className="admin-note" role="status">{notice}</p>}
      </section>
    </div>
  );
}
