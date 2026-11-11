import { useEffect, useMemo, useRef, useState } from 'react';
import { t } from '../lib/childUi';
import { g } from '../lib/grownUi';
import { NO_VOICE, UI, V, findStory, langById, splitKorean } from '../content';
import { Bi, Scene, Tile, TopBar, useSayWord } from '../components/ui';
import { useProgress, type ReadMode } from '../lib/progress';
import { hasVoice, onVoicesChanged, speak, speechSupported, stopSpeaking, wordStarts, type SpeechItem } from '../lib/speech';
import { useNav } from '../nav';
import { usePlan } from '../lib/plan';
import { ReadLimit } from './Subscribe';

/** Splits text into word tokens (with their start offsets) and the spaces between them. */
function tokenize(text: string) {
  const starts = wordStarts(text);
  return starts.map((s, i) => {
    const end = i + 1 < starts.length ? starts[i + 1] : text.length;
    return { start: s, text: text.slice(s, end) };
  });
}

/** Index of the token that contains a character offset. */
const tokenAt = (toks: { start: number }[], ch: number) => {
  let k = 0;
  for (let i = 0; i < toks.length; i++) if (toks[i].start <= ch) k = i;
  return k;
};

type Hi = { line: 'mo' | 'ko'; word: number } | null;

/** Checks today's reading allowance before opening the story. */
export function Reader({ storyId }: { storyId: string }) {
  const plan = usePlan();
  const [ok] = useState(() => plan.canRead(storyId));
  useEffect(() => { if (ok) plan.markRead(storyId); }, [ok, storyId]); // eslint-disable-line react-hooks/exhaustive-deps
  return ok ? <StoryReader storyId={storyId} /> : <><TopBar /><ReadLimit /></>;
}

function StoryReader({ storyId }: { storyId: string }) {
  const { p, set, addWord } = useProgress();
  const nav = useNav();
  const say = useSayWord();
  const st = findStory(storyId);
  const start = p.pages[st.id] ?? 0;
  const [page, setPage] = useState(start < st.pages.length ? start : 0);
  const [speaking, setSpeaking] = useState(false);
  const [hi, setHi] = useState<Hi>(null);
  const [voiceNote, setVoiceNote] = useState('');
  const [showTools, setShowTools] = useState(false);
  const [hideNoVoice, setHideNoVoice] = useState(false);
  const [turning, setTurning] = useState<number | null>(null);
  const lang = langById(p.lang);
  const ui = UI[p.lang];
  const pg = st.pages[page];
  const last = page === st.pages.length - 1;
  const showMother = p.mode !== 'ko';
  const showKorean = p.mode !== 'mo';

  const moToks = useMemo(() => tokenize(pg[p.lang]), [pg, p.lang]);
  const koToks = useMemo(() => tokenize(pg.ko), [pg]);

  useEffect(() => {
    set('pages', { ...p.pages, [st.id]: page });
    set('lastOpenedStoryId', st.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);
  useEffect(() => () => stopSpeaking(), []);
  const [, bump] = useState(0);
  useEffect(() => onVoicesChanged(() => bump((n) => n + 1)), []);
  const motherVoice = hasVoice(lang.tts);

  const stop = () => {
    stopSpeaking();
    setSpeaking(false);
    setHi(null);
  };

  const go = (d: number) => {
    stop();
    setVoiceNote('');
    if (d > 0 && last) {
      set('pages', { ...p.pages, [st.id]: 0 });
      addWord('finished', st.id);
      nav({ view: 'done', story: st.id });
      return;
    }
    // Turning forward: the old picture peels away from the bottom-right corner (like the bookshelf cards).
    if (d > 0 && !matchMedia('(prefers-reduced-motion: reduce)').matches) setTurning(page);
    setPage((x) => Math.max(0, Math.min(st.pages.length - 1, x + d)));
  };

  const readAloud = () => {
    if (speaking) return stop();
    if (!speechSupported()) {
      setVoiceNote(g(p.lang, 'noTts'));
      return;
    }
    const q: SpeechItem[] = [];
    if (showMother) {
      if (motherVoice) {
        q.push({ text: pg[p.lang], lang: lang.tts, onWord: (c) => setHi({ line: 'mo', word: tokenAt(moToks, c) }) });
      } else {
        setVoiceNote(g(p.lang, 'momReads'));
      }
    }
    if (showKorean) q.push({ text: pg.ko, lang: 'ko-KR', onWord: (c) => setHi({ line: 'ko', word: tokenAt(koToks, c) }) });
    if (!q.length) return;
    setSpeaking(true);
    speak(q, () => {
      setSpeaking(false);
      setHi(null);
    });
  };

  // Picture: swipe to turn pages, tap to hear the page.
  const x0 = useRef<number | null>(null);
  const swiped = useRef(false);

  const setMode = (m: ReadMode) => {
    stop();
    set('mode', m);
  };

  const big = p.textSize === 'l';

  return (
    <div className="reader">
      <TopBar>
        <button className="size-btn settings-toggle" aria-expanded={showTools} onClick={() => setShowTools(v => !v)} lang={p.lang}>
          <svg className="gear" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9M12 3C9.4 5.6 8.2 8.6 8.2 12s1.2 6.4 3.8 9" /></svg>
          {t(p.lang, 'language')}
        </button>
      </TopBar>
      {showTools && <div className="reader-settings" role="group" aria-label={t(p.lang, 'language')} lang={p.lang}>
        <div className="reader-tools">
          <button
            className="size-btn"
            aria-label={g(p.lang, big ? 'sizeM' : 'sizeL')}
            aria-pressed={big}
            onClick={() => set('textSize', big ? 'm' : 'l')}
          >
            A<span>{big ? '−' : '+'}</span>
          </button>
          <div className="seg" role="group" aria-label={g(p.lang, 'readingView')}>
            <button aria-pressed={p.mode === 'both'} onClick={() => setMode('both')}>{g(p.lang, 'together')}</button>
            <button aria-pressed={p.mode === 'mo'} onClick={() => setMode('mo')}>{lang.name}</button>
            <button aria-pressed={p.mode === 'ko'} onClick={() => setMode('ko')}>{g(p.lang, 'korean')}</button>
          </div>
        </div>
      </div>}
      <div className={`reader-head${page > 0 ? ' reader-small-heading' : ''}`}>
        <h2 lang={p.lang}>{st.title[p.lang]}</h2>
        <p className="lead" style={{ margin: '2px 0 0' }}>{st.title.ko}</p>
      </div>

      <button
        className={`scene-btn${speaking ? ' on' : ''}`}
        aria-label={speaking ? '읽기 멈추기' : '그림을 눌러 이 쪽 듣기'}
        onTouchStart={(e) => { x0.current = e.touches[0].clientX; swiped.current = false; }}
        onTouchEnd={(e) => {
          if (x0.current == null) return;
          const d = e.changedTouches[0].clientX - x0.current;
          if (Math.abs(d) > 50) { swiped.current = true; go(d < 0 ? 1 : -1); }
          x0.current = null;
        }}
        onClick={() => { if (swiped.current) { swiped.current = false; return; } readAloud(); }}
      >
        <Scene key={page} page={pg} alt="" />
        {turning != null && turning !== page && (
          <span className="page-turn" key={`turn-${turning}`} aria-hidden="true" onAnimationEnd={() => setTurning(null)}>
            <Scene page={st.pages[turning]} alt="" />
            <span className="page-flap" />
          </span>
        )}
        <span className="tap-hint" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" /></svg>
        </span>
      </button>

      <div className={`text${big ? ' big' : ''}`}>
        {showMother && !motherVoice && speechSupported() && !hideNoVoice && (
          <div className="novoice" role="note">
            <span className="novoice-ico" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="m17 9 5 5m0-5-5 5" fill="none" /></svg>
            </span>
            <p>
              <b lang={p.lang}>{NO_VOICE[p.lang]}</b>
            </p>
            <button className="novoice-x" aria-label="안내 닫기" onClick={() => setHideNoVoice(true)}>✕</button>
          </div>
        )}
        {showMother && (
          <p className="mother" lang={p.lang}>
            {moToks.map((t, i) => (
              <span key={i} className={hi?.line === 'mo' && hi.word === i ? 'hl' : undefined}>{t.text}</span>
            ))}
          </p>
        )}
        {showKorean && (
          <p className={`korean${showMother ? '' : ' solo'}`} lang="ko">
            {koToks.map((t, i) => (
              <span key={i} className={hi?.line === 'ko' && hi.word === i ? 'hl' : undefined}>
                {splitKorean(t.text).map((part, j) =>
                  part.word ? (
                    <button key={j} className="w" onClick={() => say(part.word!)}>{part.text}</button>
                  ) : (
                    <span key={j}>{part.text}</span>
                  ),
                )}
              </span>
            ))}
          </p>
        )}
      </div>

      <section className="reader-words">
        <p className="label" lang={p.lang}><b className="label-main">{g(p.lang, 'pictureWords')}</b><span className="label-sub">{g(p.lang, 'tapToListen')}</span></p>
        <div className="pw">
          {pg.w.map((id) => (
            <button key={id} className="pchip" onClick={() => say(id)}>
              <Tile id={id} />
              <span>
                <b>{V[id].ko}</b>
                <small lang={p.lang}>{V[id][p.lang]}</small>
              </span>
            </button>
          ))}
        </div>
      </section>
      <p className="voice">{voiceNote}</p>

      <div className="dock-space" aria-hidden="true" />
      <div className="dock">
        <div className="dock-inner">
          <div className="pager" aria-label={g(p.lang, 'page', { a: page + 1, b: st.pages.length })}>
            <span className="page-bar" aria-hidden="true"><i style={{ width: `${((page + 1) / st.pages.length) * 100}%` }} /></span>
            <span className="page-count" aria-hidden="true">{page + 1} / {st.pages.length}</span>
          </div>
          <div className="controls">
            <button className="round nav" disabled={page === 0} onClick={() => go(-1)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
              <small lang={p.lang}>{t(p.lang, 'prev')}</small>
            </button>
            <button className={`play${speaking ? ' on' : ''}`} onClick={readAloud}>
              <span className="ico" aria-hidden="true">
                {speaking
                  ? <svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2.5" /></svg>
                  : <svg viewBox="0 0 24 24"><path d="M8 5.6v12.8a1.2 1.2 0 0 0 1.8 1l10-6.4a1.2 1.2 0 0 0 0-2l-10-6.4A1.2 1.2 0 0 0 8 5.6Z" /></svg>}
              </span>
              {speaking ? <Bi mo={ui.stop} ko="멈추기" /> : <Bi mo={ui.listen} ko="듣기" />}
            </button>
            <button className={`round nav${last ? ' go' : ''}`} onClick={() => go(1)}>
              {last
                ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>}
              <small lang={p.lang}>{t(p.lang, last ? 'finish' : 'next')}</small>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
