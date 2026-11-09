import { useState } from 'react';
import { t } from '../lib/childUi';
import { ALL_WORDS, LANGS, STORIES, type LangId, type Story } from '../content';
import { Illus, Scene, Tile, WordCard } from '../components/ui';
import { useProgress } from '../lib/progress';
import { useNav, type HomeTab } from '../nav';

/* ---------- language ---------- */

function LanguageSheet({ welcome, onClose }: { welcome: boolean; onClose: () => void }) {
  const { p, set } = useProgress();
  const pick = (id: LangId) => {
    set('lang', id);
    set('langChosen', true);
    onClose();
  };
  return (
    <div className="sheet-backdrop" onClick={welcome ? undefined : onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="lang-title" onClick={(e) => e.stopPropagation()}>
        {welcome ? (
          <>
            <Illus name="welcome" className="illus welcome-art" />
            <p className="sheet-kicker">엄마말 그림책에 오신 걸 환영해요</p>
            <h2 id="lang-title">우리 집에서는 어떤 말을 쓰나요?</h2>
            <p className="lead">고른 말과 한국어로 동화를 함께 읽어요. 나중에 언제든 바꿀 수 있어요.</p>
          </>
        ) : (
          <h2 id="lang-title">우리 집 말 바꾸기</h2>
        )}
        <div className="lang-list">
          {LANGS.map((l) => (
            <button key={l.id} className="lang-opt" aria-pressed={p.langChosen && l.id === p.lang} onClick={() => pick(l.id)}>
              <b>{l.name}</b>
              <span>{l.ko}</span>
            </button>
          ))}
        </div>
        {!welcome && <section className="parent-settings">
          <h3>보호자 설정</h3>
          <p>아이의 읽기 방식과 글자 크기를 바꿀 수 있어요.</p>
          <div className="seg parent-setting-row" role="group" aria-label="읽기 언어">
            <button aria-pressed={p.mode === 'both'} onClick={() => set('mode','both')}>두 언어</button>
            <button aria-pressed={p.mode === 'mo'} onClick={() => set('mode','mo')}>모국어</button>
            <button aria-pressed={p.mode === 'ko'} onClick={() => set('mode','ko')}>한국어</button>
          </div>
          <div className="seg parent-setting-row" role="group" aria-label="글자 크기">
            <button aria-pressed={p.textSize === 'm'} onClick={() => set('textSize','m')}>보통 글자</button>
            <button aria-pressed={p.textSize === 'l'} onClick={() => set('textSize','l')}>큰 글자</button>
          </div>
          <div className="seg parent-setting-row" role="group" aria-label="받아쓰기 방식">
            <button aria-pressed={p.dictMode === 'blocks'} onClick={() => set('dictMode','blocks')}>글자 블록</button>
            <button aria-pressed={p.dictMode === 'keys'} onClick={() => set('dictMode','keys')}>자판 입력</button>
          </div>
          <p lang={p.lang} className="parent-tip">아이와 모국어로 먼저 읽고 한국어로 다시 읽어 보세요.</p>
        </section>}
        {!welcome && <button className="btn2" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}

/* ---------- books tab ---------- */

function BookCard({ s, wide = true }: { s: Story; wide?: boolean }) {
  const { p } = useProgress();
  const nav = useNav();
  const info = (
    <>
      <b lang={p.lang}>{s.title[p.lang]}</b>
      <span>{s.title.ko}</span>
      <span className="book-sub">{s.sub}</span>
    </>
  );
  return (
    <button className={`book${wide ? ' wide' : ''}`} onClick={() => nav({ view: 'read', story: s.id })}>
      <Scene page={s.pages[0]} className="cover" />
      {wide ? (
        <div>
          {s.culture && <span className="ctag">문화 비교 카드</span>}
          {info}
        </div>
      ) : (
        info
      )}
    </button>
  );
}

function ContinueCard() {
  const { p } = useProgress();
  const nav = useNav();
  const s = STORIES.find((x) => x.id === p.lastOpenedStoryId && (p.pages[x.id] ?? 0) > 0)
    ?? STORIES.find((x) => (p.pages[x.id] ?? 0) > 0);
  if (!s) return null;
  const page = p.pages[s.id];
  return (
    <button className="continue" onClick={() => nav({ view: 'read', story: s.id })}>
      <Scene page={s.pages[page]} className="cover" />
      <div>
        <span className="label" style={{ margin: 0 }}>{t(p.lang, 'continue')} · 이어 읽기</span>
        <b lang={p.lang}>{s.title[p.lang]}</b>
        <span>{s.title.ko} · {page + 1} / {s.pages.length}쪽</span>
        <div className="mini-bar"><i style={{ width: `${((page + 1) / s.pages.length) * 100}%` }} /></div>
      </div>
      <span className="go-arrow" aria-hidden="true">›</span>
    </button>
  );
}

function BooksTab() {
  const { p } = useProgress();
  return (
    <>
      <ContinueCard />
      <section>
        <p className="label">{t(p.lang, 'newStories')} · 새 이야기</p>
        <div className="shelf">
          {STORIES.filter((s) => !s.culture).map((s) => <BookCard key={s.id} s={s} wide />)}
        </div>
      </section>
      <section>
        <p className="label">우리의 문화 이야기</p>
        {STORIES.filter((s) => s.culture).map((s) => <BookCard key={s.id} s={s} wide />)}
      </section>
    </>
  );
}

/* ---------- study tab ---------- */

const ACTIVITIES = [
  { view: 'quiz', icon: '◎', name: '낱말 놀이', hint: '소리를 듣고 그림을 골라요. 글을 몰라도 할 수 있어요.', step: '알아보기' },
  { view: 'trace', icon: '✍', name: '따라 쓰기', hint: '번호와 화살표를 따라 획순대로 써요.', step: '따라 쓰기' },
  { view: 'dict', icon: '✎', name: '받아쓰기', hint: '듣고 글자 블록이나 자판으로 써요.', step: '혼자 쓰기' },
] as const;

function StudyTab() {
  const { p, set } = useProgress();
  const nav = useNav();
  const scopes: [string, string][] = [['all', '모든 낱말'], ...STORIES.map((s): [string, string] => [s.id, s.title.ko])];
  return (
    <>
      <details className="parent-scope">
        <summary>이야기 선택 · 모든 낱말</summary>
        <p className="label" style={{ margin: 0 }}>무엇으로 공부할까요?</p>
        <div className="chips" role="group" aria-label="공부할 낱말">
          {scopes.map(([id, name]) => (
            <button key={id} className="chip" aria-pressed={p.scope === id} onClick={() => set('scope', id)}>{name}</button>
          ))}
        </div>
      </details>
      <section className="stack">
        <p className="label" style={{ margin: 0 }}>그림을 누르고 놀아요</p>
        <ol className="act-list">
          {ACTIVITIES.map((a, i) => (
            <li key={a.view}>
              <button className="act-row" onClick={() => nav({ view: a.view, story: p.scope })}>
                <span className="act-icon" aria-hidden="true"><Illus name={`act-${a.view}`} className="" /></span>
                <span className="act-text">
                  <small>{i + 1}단계 · {a.step}</small>
                  <b>{a.name}</b>
                  <span>{a.hint}</span>
                </span>
                <span className="go-arrow" aria-hidden="true">›</span>
              </button>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

/* ---------- words tab ---------- */

function WordsTab() {
  const { p } = useProgress();
  const pct = Math.round((p.learned.length / ALL_WORDS.length) * 100);
  return (
    <>
      <details className="parent-stats"><summary>모은 낱말 기록 보기</summary><section className="summary">
        <div><b>{p.learned.length}</b><span>모은 낱말</span></div>
        <div><b>{p.written.length}</b><span>받아쓴 낱말</span></div>
        <div><b>{p.traced.length}</b><span>따라 쓴 낱말</span></div>
      </section>
      </details>
      <div className="mini-bar" aria-label={`전체 낱말 중 ${pct}% 모음`}><i style={{ width: `${pct}%` }} /></div>
      {p.learned.length === 0 && (
        <section className="empty-words">
          <Illus name="empty-words" className="illus empty-art" />
          <p>낱말 친구를 만나러 가 볼까요? 놀기에서 시작해요!</p>
        </section>
      )}
      <section>
        <p className="label">{t(p.lang,'words')} · 내 낱말을 눌러 들어요</p>
        <div className="wbook">
          {ALL_WORDS.filter((id) => p.learned.includes(id)).map((id) =>
            p.learned.includes(id) ? (
              <WordCard key={id} id={id} />
            ) : (
              <div key={id} className="wcard locked">
                <Tile id={id} dim />
                <b>?</b>
                <span>놀이로 모아요</span>
              </div>
            ),
          )}
        </div>
      </section>
    </>
  );
}

/* ---------- shell ---------- */

const TABS: { id: HomeTab; label: string; icon: string }[] = [
  { id: 'books', label: '책장', icon: 'M4 5a2 2 0 0 1 2-2h4v16H6a2 2 0 0 0-2 2V5Zm16 0a2 2 0 0 0-2-2h-4v16h4a2 2 0 0 1 2 2V5Z' },
  { id: 'study', label: '공부', icon: 'M4 20l4-1 11-11-3-3L5 16l-1 4Zm11-14 3 3' },
  { id: 'words', label: '낱말장', icon: 'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3Z' },
];

const TITLES: Record<HomeTab, [string, string]> = {
  books: ['엄마말 그림책', '엄마 아빠의 말로 읽고, 한국어 낱말을 모아요'],
  study: ['공부하기', '책을 읽지 않아도 바로 시작할 수 있어요'],
  words: ['내 낱말장', '맞힌 낱말이 모여요. 받아쓰기까지 하면 ✎ 표시가 붙어요'],
};

export function Home({ tab }: { tab: HomeTab }) {
  const { p } = useProgress();
  const nav = useNav();
  const [sheet, setSheet] = useState(false);
  const lang = LANGS.find((l) => l.id === p.lang)!;
  const [title] = TITLES[tab];

  return (
    <>
      <header className="home-head">
        <div>
          <h1>{title}</h1>
          <p className="lead">{tab === 'books' ? '오늘은 어떤 이야기를 볼까요?' : tab === 'study' ? '그림을 보고, 소리를 듣고 놀아요!' : '내가 모은 낱말 친구들'}</p>
        </div>
        <button className="lang-btn" onClick={() => setSheet(true)} aria-label={`우리 집 말: ${lang.ko}. 바꾸기`}>
          <small>🔒 {t(p.lang, 'parent')}</small>
          <b>{lang.name} ▾</b>
        </button>
      </header>

      {tab === 'books' && <BooksTab />}
      {tab === 'study' && <StudyTab />}
      {tab === 'words' && <WordsTab />}

      <details className="parent-footer"><summary>🔒 보호자 안내 · 문의</summary><p lang={p.lang}>모국어로 함께 읽고 한국어로 다시 읽어 보세요.</p><footer className="home-foot">
        <span>함께 만들어 가는 그림책이에요. 번역 오류나 의견을 알려 주세요.</span>
        <button className="foot-link" onClick={() => nav({ view: 'contact' })}>문의하기 ›</button>
      </footer></details>

      <div className="tabbar-space" aria-hidden="true" />
      <nav className="tabbar" aria-label="메뉴">
        {TABS.map((item) => (
          <button key={item.id} aria-current={tab === item.id ? 'page' : undefined} onClick={() => nav({ view: 'home', tab: item.id })}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d={item.icon} /></svg>
            <span>{item.id === 'books' ? '이야기' : item.id === 'study' ? '놀기' : '내 낱말'}</span>
            <small>{t(p.lang,item.id === 'books' ? 'books' : item.id === 'study' ? 'play' : 'words')}</small>
          </button>
        ))}
      </nav>

      {(sheet || !p.langChosen) && <LanguageSheet welcome={!p.langChosen} onClose={() => setSheet(false)} />}
    </>
  );
}
