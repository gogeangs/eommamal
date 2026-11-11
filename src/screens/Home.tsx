import { useEffect, useRef, useState } from 'react';
import { t } from '../lib/childUi';
import { ALL_WORDS, LANGS, STORIES, UI, type LangId, type Story } from '../content';
import { storySub } from '../content/storySubs';
import { Bi, Chevron, ChevronRight, Illus, Scene, Tile, WordCard } from '../components/ui';
import { childName, useProgress } from '../lib/progress';
import { Avatar } from './Parent';
import { pt } from '../lib/parentUi';
import { ChildManager, Parent } from './Parent';
import { AccountPanel } from './AccountPanel';
import { useAccount } from '../lib/account';
import { g } from '../lib/grownUi';
import { usePlan } from '../lib/plan';
import { useNav, type HomeTab } from '../nav';

/* ---------- language ---------- */

function LanguageSheet({ welcome, onClose }: { welcome: boolean; onClose: () => void }) {
  const { p, set } = useProgress();
  const nav = useNav();
  const pick = (id: LangId) => {
    set('lang', id);
    set('langChosen', true);
    onClose();
    // First run: always start on the bookshelf, whatever tab the link pointed at.
    if (welcome) nav({ view: 'home', tab: 'books' }, { replace: true });
  };
  return (
    <div className={`sheet-backdrop${welcome ? ' welcome' : ''}`} onClick={welcome ? undefined : onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="lang-title" onClick={(e) => e.stopPropagation()}>
        {welcome ? (
          <>
            <Illus name="welcome" className="illus welcome-art" />
            {/* Before a language is chosen we can't know it yet, so the welcome is in English. */}
            <p className="sheet-kicker" lang="en">{g('en', 'welcomeKicker')}</p>
            <h2 id="lang-title" lang="en">{g('en', 'welcomeTitle')}</h2>
            <p className="lead" lang="en">{g('en', 'welcomeLead')}</p>
          </>
        ) : (
          <h2 id="lang-title" lang={p.lang}>{g(p.lang, 'changeLang')}</h2>
        )}
        <div className="lang-list">
          {LANGS.map((l) => (
            <button key={l.id} className="lang-opt" aria-pressed={p.langChosen && l.id === p.lang} onClick={() => pick(l.id)}>
              <b lang={l.id}>{l.name}</b>
            </button>
          ))}
        </div>
        {!welcome && <section className="parent-settings" lang={p.lang}>
          <h3>{g(p.lang, 'parentSettings')}</h3>
          <p>{g(p.lang, 'settingsLead')}</p>
          <div className="seg parent-setting-row" role="group" aria-label={g(p.lang, 'readingView')}>
            <button aria-pressed={p.mode === 'both'} onClick={() => set('mode','both')}>{g(p.lang, 'modeBoth')}</button>
            <button aria-pressed={p.mode === 'mo'} onClick={() => set('mode','mo')}>{g(p.lang, 'modeMo')}</button>
            <button aria-pressed={p.mode === 'ko'} onClick={() => set('mode','ko')}>{g(p.lang, 'modeKo')}</button>
          </div>
          <div className="seg parent-setting-row" role="group" aria-label={g(p.lang, 'textSize')}>
            <button aria-pressed={p.textSize === 'm'} onClick={() => set('textSize','m')}>{g(p.lang, 'sizeM')}</button>
            <button aria-pressed={p.textSize === 'l'} onClick={() => set('textSize','l')}>{g(p.lang, 'sizeL')}</button>
          </div>
          <div className="seg parent-setting-row" role="group">
            <button aria-pressed={p.dictMode === 'blocks'} onClick={() => set('dictMode','blocks')}>{g(p.lang, 'dictBlocks')}</button>
            <button aria-pressed={p.dictMode === 'keys'} onClick={() => set('dictMode','keys')}>{g(p.lang, 'dictKeys')}</button>
          </div>
          <p className="parent-tip">{g(p.lang, 'readTip')}</p>
        </section>}
        {!welcome && <button className="play sheet-close" lang={p.lang} onClick={onClose}>{g(p.lang, 'close')}</button>}
      </div>
    </div>
  );
}

/* ---------- books tab ---------- */

function storyProgress(s: Story, pages: Record<string, number>, finished: string[]) {
  const at = pages[s.id] ?? 0;
  if (at > 0) return Math.round((at / s.pages.length) * 100);
  return finished.includes(s.id) ? 100 : 0;
}

const reducedMotion = () => {
  try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
};

/** A story on the shelf. Tapping flips the card to show the story's picture, then opens the book. */
/** One line of text that never wraps: shrinks its font (down to `min` px) until it fits the space it has. */
function FitLine({ text, lang, className, min = 10 }: { text: string; lang: string; className?: string; min?: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      el.style.fontSize = '';
      let size = parseFloat(getComputedStyle(el).fontSize);
      while (el.scrollWidth > el.clientWidth + 1 && size > min) {
        size -= 0.5;
        el.style.fontSize = `${size}px`;
      }
    };
    fit();
    document.fonts?.ready.then(fit).catch(() => {});
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [text, lang, min]);
  return <p ref={ref} className={`${className ?? ''} fit-line`} lang={lang}>{text}</p>;
}

/** Cards rise and fade in as they scroll into view (once). */
function useRevealOnScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  // Kept in React state (not classList) so a later re-render — e.g. the page-curl on tap — doesn't drop it.
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion() || typeof IntersectionObserver === 'undefined') { setShown(true); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShown(true); io.disconnect(); }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, shown] as const;
}

function BookCard({ s }: { s: Story }) {
  const [reveal, shown] = useRevealOnScroll<HTMLDivElement>();
  const { p } = useProgress();
  const plan = usePlan();
  const later = !plan.canRead(s.id);
  const nav = useNav();
  const [flipped, setFlipped] = useState(false);
  const pct = storyProgress(s, p.pages, p.finished);
  const open = () => {
    if (flipped) return;
    if (reducedMotion()) { nav({ view: 'read', story: s.id }); return; }
    setFlipped(true);
    window.setTimeout(() => nav({ view: 'read', story: s.id }), 820);
  };
  return (
    <div ref={reveal} className={`book-flip reveal${shown ? ' in' : ''}${flipped ? ' flipped' : ''}`}>
      <div className="flip-inner">
        <button className="book wide flip-front" onClick={open}>
          <Scene page={s.pages[0]} className="cover" />
          <div>
            {(s.culture || s.folk || s.life || later) && (
              <span className="ctags">
                {s.culture && <span className="ctag" lang={p.lang}>{t(p.lang, 'tagCulture')}</span>}
                {s.folk && <span className="ctag folk" lang={p.lang}>{t(p.lang, 'tagFolk')}</span>}
                {s.life && <span className="ctag life" lang={p.lang}>{t(p.lang, 'tagLife')}</span>}
                {later && <span className="ctag later" lang={p.lang}>{t(p.lang, 'tagLater')}</span>}
              </span>
            )}
            <b lang={p.lang}>{s.title[p.lang]}</b>
            <span className="book-ko" lang="ko">{s.title.ko}</span>
            {(() => { const d = storySub(s, p.lang); return <span className="book-sub" lang={d.lang}>{d.text}</span>; })()}
            <span className="book-progress" aria-label={`${pct}% 읽었어요`}>
              <span className="mini-bar"><i style={{ width: `${pct}%` }} /></span>
              <em>{pct}%</em>
            </span>
          </div>
          <span className="read-tab" aria-hidden="true" lang={p.lang}>{UI[p.lang].read}</span>
        </button>
        <span className="curl-flap" aria-hidden="true" />
        <div className="flip-back" aria-hidden="true">
          <Scene page={s.pages[0]} className="cover" />
        </div>
      </div>
    </div>
  );
}

/** Bookshelf header: the app's illustration, and the family's plan in the two stat slots. */
function Hero() {
  const { p } = useProgress();
  return (
    <section className="hero" aria-label="엄마말 그림책">
      <div className="hero-text">
        <h1 lang={p.lang}>{t(p.lang, 'storyPrompt')}</h1>
        <p className="lead hero-ko" lang="ko">오늘은 어떤 이야기를 읽을까요?</p>
      </div>
      <Illus name="hero-star" className="hero-art" />
    </section>
  );
}

function BooksTab() {
  const { p } = useProgress();
  return (
    <>
      <section>
        <div className="shelf">
          {STORIES.filter((s) => !s.culture && !s.hidden).map((s) => <BookCard key={s.id} s={s} />)}
        </div>
      </section>
      <section>
        <p className="label"><Bi row mo={t(p.lang, 'cultureStories')} ko="한국 문화 이야기" /></p>
        <div className="shelf">
          {STORIES.filter((s) => s.culture && !s.hidden).map((s) => <BookCard key={s.id} s={s} />)}
        </div>
      </section>
    </>
  );
}

/* ---------- study tab ---------- */

const ACTIVITIES = [
  { view: 'quiz', name: '낱말 놀이', step: '알아보기' },
  { view: 'trace', name: '따라 쓰기', step: '따라 쓰기' },
  { view: 'dict', name: '받아쓰기', step: '혼자 쓰기' },
  { view: 'sent', name: '문장 받아쓰기', step: '문장 쓰기' },
] as const;

function StudyTab() {
  const { p, set } = useProgress();
  const nav = useNav();
  const scopes: [string, string][] = [['all', '모든 낱말'], ...STORIES.map((s): [string, string] => [s.id, s.title.ko])];
  return (
    <>
      <section className="parent-scope">
        <p className="label" style={{ margin: 0 }}>무엇으로 공부할까요?</p>
        <div className="chips" role="group" aria-label="공부할 낱말">
          {scopes.map(([id, name]) => (
            <button key={id} className="chip" aria-pressed={p.scope === id} onClick={() => set('scope', id)}>{name}</button>
          ))}
        </div>
      </section>
      <section className="stack">
        <p className="label" style={{ margin: 0 }}>그림을 누르고 놀아요</p>
        <ol className="act-list">
          {ACTIVITIES.map((a, i) => (
            <li key={a.view}>
              <button className="act-row" onClick={() => nav({ view: a.view, story: p.scope })}>
                <span className="act-icon" aria-hidden="true"><Illus name={`act-${a.view === 'sent' ? 'dict' : a.view}`} className="" /></span>
                <span className="act-text">
                  <small>{i + 1}단계 · {a.step}</small>
                  <b>{t(p.lang, a.view === 'quiz' ? 'play' : a.view === 'trace' ? 'trace' : a.view === 'dict' ? 'dictation' : 'sentence')}</b>
                  <span>{a.name}</span>
                </span>
                <ChevronRight className="go-arrow" />
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
  const nav = useNav();
  return (
    <>
      <section className="parent-stats" lang={p.lang}>
      <button className="parent-link" onClick={() => nav({ view: 'parent' })}><span>{pt(p.lang, 'title')}</span><ChevronRight /></button><section className="summary">
        <div><b>{p.learned.length}</b><span>{pt(p.lang, 'words')}</span></div>
        <div><b>{p.written.length}</b><span>{pt(p.lang, 'written')}</span></div>
        <div><b>{p.traced.length}</b><span>{t(p.lang, 'trace')}</span></div>
      </section>
      </section>
      {p.learned.length === 0 && (
        <section className="empty-words">
          <Illus name="empty-words" className="illus empty-art" />
          <p><Bi mo={t(p.lang, 'emptyWords')} ko={"낱말 친구를 만나러 가 볼까요?\n놀기에서 시작해요!"} /></p>
        </section>
      )}
      <section>
        <p className="label"><Bi row mo={t(p.lang,'words')} ko="눌러서 들어요" /></p>
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
  { id: 'books', label: '책장', icon: 'M3 5.6C3 4.7 3.7 4 4.6 4H10a2 2 0 0 1 2 2v14.2c-.6-.7-1.5-1.2-2.5-1.2H4.6c-.9 0-1.6-.7-1.6-1.6V5.6Zm18 0c0-.9-.7-1.6-1.6-1.6H14a2 2 0 0 0-2 2v14.2c.6-.7 1.5-1.2 2.5-1.2h4.9c.9 0 1.6-.7 1.6-1.6V5.6Z' },
  { id: 'study', label: '공부', icon: 'M15 3.4a2 2 0 0 1 2.8 0l2.8 2.8a2 2 0 0 1 0 2.8L9.6 20 4.4 21.2a.6.6 0 0 1-.7-.7L4.9 15.3 15 3.4Z' },
  { id: 'words', label: '낱말장', icon: 'M12 2.8l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 16.7l-5.4 2.9 1.1-6.1-4.5-4.3 6.1-.8L12 2.8Z' },
  { id: 'progress', label: '기록', icon: 'M12.78 3.03A9 9 0 1 1 3.03 12.78L7.62 12.38A4.4 4.4 0 1 0 12.38 7.62ZM3.03 11.22A9 9 0 0 1 11.22 3.03L11.62 7.62A4.4 4.4 0 0 0 7.62 11.62Z' },
  { id: 'settings', label: '설정', icon: 'M12 12.2a4.6 4.6 0 1 0 0-9.2 4.6 4.6 0 0 0 0 9.2ZM3.8 20.2c0-4.3 3.7-6.8 8.2-6.8s8.2 2.5 8.2 6.8c0 .6-.5 1-1 1H4.8c-.5 0-1-.4-1-1Z' },
];

const TAB_TERM = { books: 'books', study: 'play', words: 'words', progress: 'progressTab', settings: 'settings' } as const;

/** Settings tab: the parent's account, home language & reading options, and children. Grown-up screen → family language only. */
function SettingsTab({ onLanguage }: { onLanguage: () => void }) {
  const { p } = useProgress();
  const acc = useAccount();
  const lang = LANGS.find((l) => l.id === p.lang)!;
  const L = p.lang;
  return (
    <div className="settings-tab stack" lang={L}>

      {acc.enabled ? <AccountPanel /> : (<>
        <h2 className="ph"><span>{pt(L, 'account')}</span></h2>
        <section className="pcard account-soon">
          <span className="acc-avatar" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 12.2a4.1 4.1 0 1 0 0-8.2 4.1 4.1 0 0 0 0 8.2ZM4.5 20.5a7.5 7.5 0 0 1 15 0" /></svg></span>
          <div>
            <p className="ptip">{pt(L, 'accountWhy')}</p>
            <button className="btn2 soon-btn" disabled>{g(L, 'signIn')} ({t(L, 'soon')})</button>
          </div>
        </section>
      </>)}

      <button className="settings-row" onClick={onLanguage}>
        <span>{t(L, 'language')}</span>
        <b>{lang.name}</b>
        <Chevron />
      </button>

      <h2 className="ph"><span>{pt(L, 'children')}</span></h2>
      <ChildManager />

      <p className="pnote privacy">{pt(L, acc.email ? 'privacySync' : 'privacy')}</p>
    </div>
  );
}

const TITLES: Record<HomeTab, [string, string]> = {
  books: ['엄마말 그림책', '엄마 아빠의 말로 읽고, 한국어 낱말을 모아요'],
  study: ['공부하기', '책을 읽지 않아도 바로 시작할 수 있어요'],
  words: ['내 낱말장', '맞힌 낱말이 모여요. 받아쓰기까지 하면 ✎ 표시가 붙어요'],
  progress: ['우리 아이 기록', ''],
  settings: ['설정', ''],
};

function ChildSheet({ onClose }: { onClose: () => void }) {
  const { p, profiles, profile, switchProfile } = useProgress();
  const nav = useNav();
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="child-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="child-title" lang={p.lang}>{g(p.lang, 'whoReads')}</h2>
        <div className="lang-list">
          {profiles.map((pr, i) => (
            <button key={pr.id} className="lang-opt child-opt" aria-pressed={pr.id === profile.id} onClick={() => { switchProfile(pr.id); onClose(); }}>
              <Avatar pr={pr} size={44} />
              <b>{childName(pr, i, p.lang)}</b>
            </button>
          ))}
        </div>
        <button className="btn2" lang={p.lang} onClick={() => nav({ view: 'parent' })}>{g(p.lang, 'manageKids')}</button>
        <button className="btn2" lang={p.lang} onClick={onClose}>{g(p.lang, 'close')}</button>
      </div>
    </div>
  );
}

export function Home({ tab }: { tab: HomeTab }) {
  const { p, profiles, profile } = useProgress();
  const [kids, setKids] = useState(false);
  const nav = useNav();
  const [sheet, setSheet] = useState(false);
  const lang = LANGS.find((l) => l.id === p.lang)!;
  const [title] = TITLES[tab];

  return (
    <>
      <header className={`home-head${tab === 'books' ? ' on-hero' : ''}`}>
        {tab === 'books' && <FitLine className="hero-kicker" lang={p.lang} text={t(p.lang, 'appName')} />}
        {tab !== 'books' && <div>
          <h1 lang={p.lang}>{t(p.lang, TAB_TERM[tab])}</h1>
          <p className="lead tab-sub" lang="ko">{title}</p>
        </div>}
        <div className="home-actions">
        {profiles.length > 1 && (
          <button className="child-chip" onClick={() => setKids(true)} aria-label={`지금 읽는 아이: ${childName(profile, profiles.indexOf(profile), p.lang)}. 바꾸기`}>
            <Avatar pr={profile} size={36} />
            <span>{childName(profile, profiles.indexOf(profile), p.lang)}</span>
          </button>
        )}
        <button className="lang-btn" onClick={() => setSheet(true)} aria-label={`우리 집 말: ${lang.ko}. 바꾸기`}>
          <small>{t(p.lang, 'parent')}</small>
          <b>{lang.name}<Chevron /></b>
        </button>
        </div>
      </header>

      {tab === 'books' && <><Hero /><BooksTab /></>}
      {tab === 'study' && <StudyTab />}
      {tab === 'words' && <WordsTab />}
      {tab === 'progress' && <Parent embedded />}
      {tab === 'settings' && <SettingsTab onLanguage={() => setSheet(true)} />}

      <details className="parent-footer" lang={p.lang}><summary><span>{g(p.lang, 'guide')}</span><Chevron /></summary><p>{g(p.lang, 'readTip')}</p><footer className="home-foot">
        <span>{g(p.lang, 'footNote')}</span>
        <div className="foot-links">
          <button className="foot-link" onClick={() => nav({ view: 'contact' })}>{g(p.lang, 'contact')}<Chevron /></button>
          <button className="foot-link quiet" lang="ko" onClick={() => nav({ view: 'admin' })}>콘텐츠 관리 (운영자용)<Chevron /></button>
        </div>
      </footer></details>

      <div className="tabbar-space" aria-hidden="true" />
      <nav className="tabbar" aria-label="메뉴">
        {TABS.map((item) => (
          <button key={item.id} aria-current={tab === item.id ? 'page' : undefined} onClick={() => nav({ view: 'home', tab: item.id })}>
            <span className="tab-ico"><svg viewBox="0 0 24 24" aria-hidden="true"><path d={item.icon} /></svg></span>
            <span className="tab-label" lang={p.lang}>{t(p.lang, TAB_TERM[item.id])}</span>
          </button>
        ))}
      </nav>

      {(sheet || !p.langChosen) && <LanguageSheet welcome={!p.langChosen} onClose={() => setSheet(false)} />}
      {kids && <ChildSheet onClose={() => setKids(false)} />}
    </>
  );
}
