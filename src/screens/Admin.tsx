import { useEffect, useMemo, useRef, useState } from 'react';
import { strToU8, strFromU8, unzipSync, zipSync } from 'fflate';
import { LANGS, STORIES, V } from '../content';
import { LANG_IDS, assetUrl, emptyPack, type Pack, type PackPage, type PackStory, type PackWord } from '../content/pack';
import type { LangId } from '../content/types';
import { StorageFullError, contentStore, previewActive, publishedPack } from '../lib/contentStore';
import { bytesDataUrl, dataUrlBytes, scenePicture, wordPicture } from '../lib/imageTools';
import { useNav } from '../nav';

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
const LANG_KO = Object.fromEntries(LANGS.map((l) => [l.id, l.ko])) as Record<LangId, string>;

/** A pack entry for a story that is on the shelf now (built-in or from the published pack). */
function seedStory(id: string): PackStory {
  const s = STORIES.find((x) => x.id === id)!;
  const pick = (o: Record<string, string>) => Object.fromEntries(['ko', ...LANG_IDS].map((l) => [l, o[l] ?? '']));
  return {
    id: s.id,
    kind: s.folk ? 'folk' : 'story',
    title: pick(s.title) as PackStory['title'],
    sub: s.sub,
    pages: s.pages.map((p) => ({ ...(pick(p as unknown as Record<string, string>) as unknown as PackPage), ...(p.img ? { img: p.img } : {}), w: [...p.w] })),
    phrases: (s.phrases ?? []).map((x) => ({ ...x })),
  };
}

function seedWord(id: string): PackWord {
  const w = V[id];
  return { id, ko: w.ko, ...Object.fromEntries(LANG_IDS.map((l) => [l, w[l] ?? ''])), bg: w.bg };
}

/** Empty translation fields in a story: what still needs a translator. */
function missing(s: PackStory): number {
  let n = 0;
  for (const l of LANG_IDS) {
    if (!s.title[l]) n++;
    for (const p of s.pages) if (!p[l]) n++;
  }
  return n;
}

function download(name: string, data: Uint8Array | string, type: string) {
  const blob = new Blob([data as BlobPart], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

/** Builds the publishable zip: content/pack.json + content/images/*. */
function buildZip(pack: Pack): Uint8Array {
  const out = clone(pack);
  out.updated = new Date().toISOString();
  const files: Record<string, Uint8Array> = {};
  let n = 0;
  const store = (ref: string | undefined, name: string) => {
    if (!ref || !ref.startsWith('data:')) return ref;
    const { bytes, ext } = dataUrlBytes(ref);
    const path = `content/images/${name}-${(++n).toString(36)}${Date.now().toString(36).slice(-4)}.${ext}`;
    files[path] = bytes;
    return path;
  };
  for (const s of out.stories) s.pages.forEach((p, i) => { p.img = store(p.img, `${s.id}-${String(i + 1).padStart(2, '0')}`); });
  for (const w of out.words) w.img = store(w.img, `word-${w.id}`);
  files['content/pack.json'] = strToU8(JSON.stringify(out, null, 1));
  files['content/README.txt'] = strToU8(
    '엄마말 그림책 콘텐츠 파일\n\n이 content 폴더를 GitHub 저장소의 public 폴더 안에 그대로 올리면 (public/content/...) 몇 분 뒤 앱에 반영돼요.\n',
  );
  return zipSync(files, { level: 6 });
}

async function readPackFile(file: File): Promise<Pack> {
  const buf = new Uint8Array(await file.arrayBuffer());
  if (file.name.endsWith('.json')) return JSON.parse(strFromU8(buf)) as Pack;
  const z = unzipSync(buf);
  const key = Object.keys(z).find((k) => k.endsWith('pack.json'));
  if (!key) throw new Error('압축 파일 안에 pack.json이 없어요.');
  const root = key.slice(0, -'pack.json'.length).replace(/content\/$/, '');
  const pack = JSON.parse(strFromU8(z[key])) as Pack;
  const inline = (ref?: string) => {
    if (!ref || ref.startsWith('data:')) return ref;
    const f = z[root + ref];
    return f ? bytesDataUrl(f, ref.split('.').pop() ?? 'webp') : ref;
  };
  for (const s of pack.stories) for (const p of s.pages) p.img = inline(p.img);
  for (const w of pack.words) w.img = inline(w.img);
  return pack;
}

type View = { v: 'list' } | { v: 'story'; id: string } | { v: 'words' } | { v: 'publish' };

export function Admin() {
  const nav = useNav();
  const [pack, setPack] = useState<Pack>(() => contentStore.loadDraft() ?? clone(publishedPack ?? emptyPack()));
  const [view, setView] = useState<View>({ v: 'list' });
  const [notice, setNotice] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      try { contentStore.saveDraft(pack); setNotice((n) => (n.startsWith('저장 공간') ? '' : n)); }
      catch (e) { if (e instanceof StorageFullError) setNotice('저장 공간이 부족해요. 그림이 너무 많으면 먼저 내려받아 게시한 뒤 이어서 작업해 주세요.'); }
    }, 300);
    return () => clearTimeout(t);
  }, [pack]);

  const update = (f: (p: Pack) => void) => setPack((old) => { const p = clone(old); f(p); return p; });

  const shelf = useMemo(() => {
    const ids = [...STORIES.map((s) => s.id)];
    for (const s of pack.stories) if (!ids.includes(s.id)) ids.push(s.id);
    return ids.map((id) => {
      const ps = pack.stories.find((x) => x.id === id);
      const live = STORIES.find((x) => x.id === id);
      return { id, title: ps?.title.ko ?? live?.title.ko ?? id, edited: !!ps, isNew: !live, ps, pages: ps?.pages.length ?? live?.pages.length ?? 0, cover: ps?.pages[0]?.img ?? live?.pages[0]?.img };
    });
  }, [pack]);

  const preview = (hash = '') => {
    try { contentStore.startPreview(pack); } catch { setNotice('저장 공간이 부족해서 미리 보기를 할 수 없어요.'); return; }
    location.hash = hash;
    location.reload();
  };

  return (
    <div className="admin">
      <div className="top">
        <button className="ghost back" onClick={() => (view.v === 'list' ? nav({ view: 'home' }) : setView({ v: 'list' }))}>
          {view.v === 'list' ? '‹ 앱으로' : '‹ 목록'}
        </button>
        <button className="btn2 small" onClick={() => preview(view.v === 'story' ? `#read-${view.id}` : '')}>이 기기에서 미리 보기</button>
      </div>
      <header>
        <h1>콘텐츠 관리</h1>
        <p className="lead">동화·번역·낱말·그림을 고치고, 파일로 내려받아 게시해요. 작업 내용은 이 브라우저에 자동 저장돼요.</p>
      </header>
      {previewActive() && <p className="admin-note">지금 이 기기는 미리 보기 중이에요. 앱 위쪽 막대의 "끝내기"로 원래 내용으로 돌아갈 수 있어요.</p>}
      {notice && <p className="admin-note warn" role="alert">{notice}</p>}

      {view.v === 'list' && (
        <>
          <nav className="admin-tabs" aria-label="관리 메뉴">
            <button aria-current="page">동화</button>
            <button onClick={() => setView({ v: 'words' })}>낱말</button>
            <button onClick={() => setView({ v: 'publish' })}>내려받기·게시</button>
          </nav>
          <section className="admin-list">
            {shelf.map((s) => (
              <button key={s.id} className="admin-row" onClick={() => {
                if (!s.ps) update((p) => { p.stories.push(seedStory(s.id)); });
                setView({ v: 'story', id: s.id });
              }}>
                <span className="admin-thumb">{s.cover ? <img src={assetUrl(s.cover)} alt="" /> : null}</span>
                <span className="admin-row-text">
                  <b>{s.title}</b>
                  <small>
                    {s.id} · {s.pages}쪽
                    {s.isNew ? ' · 새 동화' : s.edited ? ' · 고친 내용 있음' : ''}
                    {s.ps?.hidden ? ' · 숨김' : ''}
                    {s.ps && missing(s.ps) ? ` · 번역 빈칸 ${missing(s.ps)}` : ''}
                  </small>
                </span>
                <span className="go-arrow" aria-hidden="true">›</span>
              </button>
            ))}
          </section>
          <NewStory existing={shelf.map((s) => s.id)} onCreate={(id, ko) => {
            update((p) => { p.stories.push({ id, kind: 'story', title: { ko }, sub: '', pages: [{ ko: '', w: [] }], phrases: [] }); });
            setView({ v: 'story', id });
          }} />
        </>
      )}

      {view.v === 'story' && (
        <StoryEditor
          story={pack.stories.find((x) => x.id === view.id)!}
          pack={pack}
          builtIn={STORIES.some((s) => s.id === view.id)}
          onChange={(f) => update((p) => f(p.stories.find((x) => x.id === view.id)!))}
          onDiscard={() => { update((p) => { p.stories = p.stories.filter((x) => x.id !== view.id); }); setView({ v: 'list' }); }}
        />
      )}

      {view.v === 'words' && <WordsEditor pack={pack} update={update} />}

      {view.v === 'publish' && (
        <section className="stack admin-publish">
          <h2>내려받기·게시</h2>
          <ol className="admin-steps">
            <li><b>미리 보기로 확인해요.</b> 위쪽 "이 기기에서 미리 보기"를 누르면 이 휴대폰·컴퓨터에서만 바뀐 내용으로 앱이 열려요.</li>
            <li><b>콘텐츠 파일을 내려받아요.</b> 그림까지 모두 담긴 압축 파일(content.zip)이에요.</li>
            <li><b>게시해요.</b> 압축을 풀면 나오는 <code>content</code> 폴더를 GitHub 저장소의 <code>public</code> 폴더에 그대로 올려 주세요(public/content/…). 몇 분 뒤 모든 사람의 앱에 반영돼요. 파일을 Claude에게 보내 주셔도 돼요.</li>
          </ol>
          <button className="play" onClick={() => download('content.zip', buildZip(pack), 'application/zip')}>콘텐츠 파일 내려받기 (content.zip)</button>
          <label className="btn2 file-btn">
            이전에 받은 파일 불러오기 (.zip / pack.json)
            <input type="file" accept=".zip,.json" onChange={async (e) => {
              const f = e.target.files?.[0]; if (!f) return;
              try { setPack(await readPackFile(f)); setNotice('파일을 불러왔어요.'); } catch (err) { setNotice(String((err as Error).message ?? err)); }
              e.target.value = '';
            }} />
          </label>
          {!confirmReset ? (
            <button className="ghost" onClick={() => setConfirmReset(true)}>작업 내용 지우고 게시된 내용으로 되돌리기</button>
          ) : (
            <div className="admin-confirm" role="alertdialog" aria-label="되돌리기 확인">
              <p>이 브라우저에 저장된 작업 내용이 지워져요. 되돌릴 수 없어요.</p>
              <div className="row">
                <button className="btn2" onClick={() => setConfirmReset(false)}>취소</button>
                <button className="play" onClick={() => { setPack(clone(publishedPack ?? emptyPack())); setConfirmReset(false); setNotice('게시된 내용으로 되돌렸어요.'); }}>되돌리기</button>
              </div>
            </div>
          )}
          <p className="k">
            게시된 콘텐츠: {publishedPack.stories.length}편 수정·추가, 낱말 {publishedPack.words.length}개
            {publishedPack.updated ? ` (${new Date(publishedPack.updated).toLocaleString('ko-KR')})` : ''}
          </p>
        </section>
      )}
    </div>
  );
}

function NewStory({ existing, onCreate }: { existing: string[]; onCreate: (id: string, ko: string) => void }) {
  const [open, setOpen] = useState(false);
  const [id, setId] = useState('');
  const [ko, setKo] = useState('');
  const err = !id ? '' : !/^[a-z]{2,20}$/.test(id) ? '영어 소문자 2~20자로 써 주세요. (예: rabbit)' : existing.includes(id) ? '이미 있는 이름이에요.' : '';
  if (!open) return <button className="play" onClick={() => setOpen(true)}>+ 새 동화 만들기</button>;
  return (
    <form className="admin-card stack" onSubmit={(e) => { e.preventDefault(); if (id && ko.trim() && !err) onCreate(id, ko.trim()); }}>
      <h2>새 동화</h2>
      <label className="field" htmlFor="ns-ko"><span className="label">한국어 제목</span>
        <input id="ns-ko" value={ko} onChange={(e) => setKo(e.target.value)} placeholder="예: 토끼와 거북이" /></label>
      <label className="field" htmlFor="ns-id"><span className="label">주소용 이름 (영어 소문자)</span>
        <input id="ns-id" value={id} onChange={(e) => setId(e.target.value.toLowerCase())} placeholder="rabbit" aria-invalid={!!err} /></label>
      {err && <p className="form-error">{err}</p>}
      <div className="row">
        <button type="button" className="btn2" onClick={() => setOpen(false)}>취소</button>
        <button type="submit" className="play" disabled={!id || !ko.trim() || !!err}>만들기</button>
      </div>
    </form>
  );
}

function LangFields({ value, onChange, multiline = false, idPrefix }: {
  value: Partial<Record<LangId | 'ko', string>>;
  onChange: (l: LangId, v: string) => void;
  multiline?: boolean;
  idPrefix: string;
}) {
  const empty = LANG_IDS.filter((l) => !value[l]).length;
  return (
    <details className="lang-fields">
      <summary>번역 6개 언어 {empty ? <em className="badge-warn">빈칸 {empty}</em> : <em className="badge-ok">모두 채움</em>}</summary>
      {LANG_IDS.map((l) => (
        <label key={l} className="field" htmlFor={`${idPrefix}-${l}`}>
          <span className="label">{LANG_KO[l]}</span>
          {multiline
            ? <textarea id={`${idPrefix}-${l}`} lang={l} rows={2} value={value[l] ?? ''} onChange={(e) => onChange(l, e.target.value)} />
            : <input id={`${idPrefix}-${l}`} lang={l} value={value[l] ?? ''} onChange={(e) => onChange(l, e.target.value)} />}
        </label>
      ))}
    </details>
  );
}

function wordOptions(pack: Pack) {
  const ids = new Set(Object.keys(V));
  for (const w of pack.words) ids.add(w.id);
  return [...ids].map((id) => ({ id, ko: pack.words.find((w) => w.id === id)?.ko ?? V[id]?.ko ?? id }));
}

function StoryEditor({ story, pack, builtIn, onChange, onDiscard }: {
  story: PackStory;
  pack: Pack;
  builtIn: boolean;
  onChange: (f: (s: PackStory) => void) => void;
  onDiscard: () => void;
}) {
  const [backdrop, setBackdrop] = useState('#E7F0E5');
  const [busy, setBusy] = useState<number | null>(null);
  const [confirm, setConfirm] = useState(false);
  const words = wordOptions(pack);
  if (!story) return null;

  return (
    <section className="stack">
      <h2>{story.title.ko || story.id} <small className="k">({story.id})</small></h2>

      <div className="admin-card stack">
        <label className="field" htmlFor="st-ko"><span className="label">한국어 제목</span>
          <input id="st-ko" value={story.title.ko} onChange={(e) => onChange((s) => { s.title.ko = e.target.value; })} /></label>
        <LangFields idPrefix="st-title" value={story.title} onChange={(l, v) => onChange((s) => { s.title[l] = v; })} />
        <label className="field" htmlFor="st-sub"><span className="label">한 줄 소개 (한국어)</span>
          <input id="st-sub" value={story.sub ?? ''} onChange={(e) => onChange((s) => { s.sub = e.target.value; })} placeholder="예: 정직한 나무꾼 이야기" /></label>
        <div className="row admin-flags">
          <label className="check"><input type="checkbox" checked={story.kind === 'folk'} onChange={(e) => onChange((s) => { s.kind = e.target.checked ? 'folk' : 'story'; })} /> 한국 전래 동화</label>
          <label className="check"><input type="checkbox" checked={!!story.hidden} onChange={(e) => onChange((s) => { s.hidden = e.target.checked; })} /> 책장에서 숨기기</label>
        </div>
      </div>

      <div className="row" style={{ alignItems: 'center' }}>
        <h3 className="admin-h3">쪽 ({story.pages.length})</h3>
        <label className="bg-pick">그림 배경색 <input type="color" value={backdrop} onChange={(e) => setBackdrop(e.target.value)} aria-label="그림 배경색" /></label>
      </div>
      <p className="k">투명 배경 그림은 이 색 위에 얹혀 3:2 비율(1200×800)로 저장돼요.</p>

      {story.pages.map((pg, i) => (
        <div key={i} className="admin-card stack">
          <div className="row" style={{ alignItems: 'center' }}>
            <b>{i + 1}쪽</b>
            <span className="admin-page-tools">
              <button className="ghost" disabled={i === 0} onClick={() => onChange((s) => { [s.pages[i - 1], s.pages[i]] = [s.pages[i], s.pages[i - 1]]; })} aria-label={`${i + 1}쪽 위로`}>↑</button>
              <button className="ghost" disabled={i === story.pages.length - 1} onClick={() => onChange((s) => { [s.pages[i + 1], s.pages[i]] = [s.pages[i], s.pages[i + 1]]; })} aria-label={`${i + 1}쪽 아래로`}>↓</button>
              <button className="ghost danger" disabled={story.pages.length === 1} onClick={() => onChange((s) => { s.pages.splice(i, 1); })}>쪽 지우기</button>
            </span>
          </div>
          <div className="admin-page">
            <label className="admin-pic">
              {pg.img ? <img src={assetUrl(pg.img)} alt={`${i + 1}쪽 그림`} /> : <span>{busy === i ? '변환 중…' : '그림 올리기'}</span>}
              <input type="file" accept="image/*" onChange={async (e) => {
                const f = e.target.files?.[0]; if (!f) return;
                setBusy(i);
                try { const url = await scenePicture(f, backdrop); onChange((s) => { s.pages[i].img = url; }); }
                finally { setBusy(null); e.target.value = ''; }
              }} />
            </label>
            <div className="stack" style={{ minWidth: 0, flex: 1 }}>
              <label className="field" htmlFor={`pg-${i}-ko`}><span className="label">한국어 문장</span>
                <textarea id={`pg-${i}-ko`} rows={2} value={pg.ko} onChange={(e) => onChange((s) => { s.pages[i].ko = e.target.value; })} /></label>
              <LangFields idPrefix={`pg-${i}`} multiline value={pg} onChange={(l, v) => onChange((s) => { s.pages[i][l] = v; })} />
            </div>
          </div>
          <WordPicker words={words} value={pg.w ?? []} onChange={(w) => onChange((s) => { s.pages[i].w = w; })} />
        </div>
      ))}
      <button className="btn2" onClick={() => onChange((s) => { s.pages.push({ ko: '', w: [] }); })}>+ 쪽 추가</button>

      <h3 className="admin-h3">문장 받아쓰기 ({story.phrases?.length ?? 0})</h3>
      <p className="k">낱말 2~4개로 된 짧은 문장을 띄어쓰기해서 적어요. 힌트로 보일 그림 낱말을 하나 골라요.</p>
      {(story.phrases ?? []).map((ph, i) => (
        <div key={i} className="admin-phrase">
          <input aria-label={`문장 ${i + 1}`} value={ph.ko} onChange={(e) => onChange((s) => { s.phrases![i].ko = e.target.value; })} placeholder="예: 비가 와요" />
          <select aria-label={`문장 ${i + 1} 힌트 그림`} value={ph.w} onChange={(e) => onChange((s) => { s.phrases![i].w = e.target.value; })}>
            <option value="">힌트 그림 없음</option>
            {words.map((w) => <option key={w.id} value={w.id}>{w.ko}</option>)}
          </select>
          <button className="ghost danger" onClick={() => onChange((s) => { s.phrases!.splice(i, 1); })} aria-label={`문장 ${i + 1} 지우기`}>✕</button>
        </div>
      ))}
      <button className="btn2" onClick={() => onChange((s) => { (s.phrases ??= []).push({ ko: '', w: '' }); })}>+ 문장 추가</button>

      <div className="admin-card stack">
        {!confirm ? (
          <button className="ghost danger" onClick={() => setConfirm(true)}>
            {builtIn ? '이 동화에서 고친 내용 모두 버리기' : '이 새 동화 지우기'}
          </button>
        ) : (
          <div className="admin-confirm" role="alertdialog" aria-label="지우기 확인">
            <p>{builtIn ? '이 동화를 원래 내용으로 되돌려요.' : '이 동화와 올린 그림이 작업 내용에서 지워져요.'} 되돌릴 수 없어요.</p>
            <div className="row">
              <button className="btn2" onClick={() => setConfirm(false)}>취소</button>
              <button className="play" onClick={onDiscard}>{builtIn ? '되돌리기' : '지우기'}</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function WordPicker({ words, value, onChange }: { words: { id: string; ko: string }[]; value: string[]; onChange: (w: string[]) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="word-picker">
      <span className="label" style={{ margin: 0 }}>이 쪽의 낱말</span>
      <div className="chips">
        {value.map((id) => (
          <button key={id} className="chip" aria-pressed onClick={() => onChange(value.filter((x) => x !== id))}>{words.find((w) => w.id === id)?.ko ?? id} ✕</button>
        ))}
        <button className="chip" onClick={() => setOpen((o) => !o)}>{open ? '닫기' : '+ 낱말'}</button>
      </div>
      {open && (
        <div className="chips picker-all">
          {words.filter((w) => !value.includes(w.id)).map((w) => (
            <button key={w.id} className="chip" onClick={() => onChange([...value, w.id])}>{w.ko}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function WordsEditor({ pack, update }: { pack: Pack; update: (f: (p: Pack) => void) => void }) {
  const [sel, setSel] = useState<string | null>(null);
  const [newId, setNewId] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const all = wordOptions(pack);
  const w = sel ? pack.words.find((x) => x.id === sel) : null;
  const idErr = !newId ? '' : !/^[a-z]{2,20}$/.test(newId) ? '영어 소문자 2~20자' : all.some((x) => x.id === newId) ? '이미 있는 이름' : '';

  const open = (id: string) => {
    if (!pack.words.some((x) => x.id === id)) update((p) => { p.words.push(seedWord(id)); });
    setSel(id);
  };

  return (
    <section className="stack">
      <h2>낱말 ({all.length})</h2>
      <p className="k">낱말을 눌러 번역과 그림을 고쳐요. 새 낱말은 동화의 "이 쪽의 낱말"에서 고를 수 있어요.</p>
      <div className="chips">
        {all.map((x) => (
          <button key={x.id} className="chip" aria-pressed={sel === x.id} onClick={() => open(x.id)}>
            {x.ko}{pack.words.some((y) => y.id === x.id) ? ' •' : ''}
          </button>
        ))}
      </div>
      <form className="row admin-newword" onSubmit={(e) => { e.preventDefault(); if (newId && !idErr) { update((p) => { p.words.push({ id: newId, ko: '', bg: '#EAF2F7' }); }); setSel(newId); setNewId(''); } }}>
        <input aria-label="새 낱말 이름 (영어 소문자)" placeholder="새 낱말 이름 (예: rabbit)" value={newId} onChange={(e) => setNewId(e.target.value.toLowerCase())} />
        <button className="btn2" type="submit" disabled={!newId || !!idErr}>+ 새 낱말</button>
      </form>
      {idErr && <p className="form-error">{idErr}</p>}

      {w && (
        <div className="admin-card stack">
          <div className="row" style={{ alignItems: 'center' }}>
            <b>{w.ko || w.id}</b><small className="k">{w.id}</small>
          </div>
          <div className="admin-page">
            <label className="admin-pic square" style={{ background: w.bg }}>
              {w.img ? <img src={assetUrl(w.img)} alt="" /> : V[w.id] ? <span>지금 그림 유지 · 바꾸려면 올리기</span> : <span>그림 올리기</span>}
              <input ref={fileRef} type="file" accept="image/*" onChange={async (e) => {
                const f = e.target.files?.[0]; if (!f) return;
                const url = await wordPicture(f);
                update((p) => { p.words.find((x) => x.id === w.id)!.img = url; });
                e.target.value = '';
              }} />
            </label>
            <div className="stack" style={{ flex: 1, minWidth: 0 }}>
              <label className="field" htmlFor="w-ko"><span className="label">한국어</span>
                <input id="w-ko" value={w.ko} onChange={(e) => update((p) => { p.words.find((x) => x.id === w.id)!.ko = e.target.value; })} /></label>
              <label className="bg-pick">타일 배경색 <input type="color" value={w.bg ?? '#EAF2F7'} onChange={(e) => update((p) => { p.words.find((x) => x.id === w.id)!.bg = e.target.value; })} aria-label="타일 배경색" /></label>
            </div>
          </div>
          <LangFields idPrefix="w" value={w} onChange={(l, v) => update((p) => { p.words.find((x) => x.id === w.id)![l] = v; })} />
          <button className="ghost danger" onClick={() => { update((p) => { p.words = p.words.filter((x) => x.id !== w.id); }); setSel(null); }}>
            {V[w.id] ? '이 낱말에서 고친 내용 버리기' : '이 새 낱말 지우기'}
          </button>
        </div>
      )}
    </section>
  );
}
