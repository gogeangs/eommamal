import { useEffect, useMemo, useRef, useState } from 'react';
import { t } from '../lib/childUi';
import { NO_VOICE, UI, V, findStory, langById, splitKorean } from '../content';
import { Scene, Tile, TopBar, useSayWord } from '../components/ui';
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
    setPage((x) => Math.max(0, Math.min(st.pages.length - 1, x + d)));
  };

  const readAloud = () => {
    if (speaking) return stop();
    if (!speechSupported()) {
      setVoiceNote('이 브라우저에서는 소리 내어 읽기를 쓸 수 없어요.');
      return;
    }
    const q: SpeechItem[] = [];
    if (showMother) {
      if (motherVoice) {
        q.push({ text: pg[p.lang], lang: lang.tts, onWord: (c) => setHi({ line: 'mo', word: tokenAt(moToks, c) }) });
      } else {
        setVoiceNote(`${lang.ko}는 엄마 아빠가 읽어 주세요. 한국어만 소리로 읽어요.`);
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
        <button className="size-btn" aria-expanded={showTools} onClick={() => setShowTools(v => !v)}>⚙ {t(p.lang, 'settings')}</button>
      </TopBar>
      {showTools && <div className="reader-settings" role="group" aria-label="읽기 설정">
        <div className="reader-tools">
          <button
            className="size-btn"
            aria-label={big ? '글자 보통 크기로' : '글자 크게'}
            aria-pressed={big}
            onClick={() => set('textSize', big ? 'm' : 'l')}
          >
            가<span>{big ? '−' : '+'}</span>
          </button>
          <div className="seg" role="group" aria-label="보기 방식">
            <button aria-pressed={p.mode === 'both'} onClick={() => setMode('both')}>함께</button>
            <button aria-pressed={p.mode === 'mo'} onClick={() => setMode('mo')}>{lang.ko}</button>
            <button aria-pressed={p.mode === 'ko'} onClick={() => setMode('ko')}>한국어</button>
          </div>
        </div>
      </div>}
      <div className={page > 0 ? 'reader-small-heading' : ''}>
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
        <span className="tap-hint" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" /></svg>
        </span>
      </button>

      <div className={`text${big ? ' big' : ''}`}>
        {showMother && !motherVoice && speechSupported() && (
          <p className="novoice" lang={p.lang}>
            <b>{NO_VOICE[p.lang]}</b>
            <span lang="ko">이 휴대폰에는 {lang.ko} 읽기 목소리가 없어요. 엄마 아빠가 소리 내어 읽어 주세요.</span>
          </p>
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
            {showMother && <span className="tag">한국어</span>}
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

      <section>
        <p className="label">그림 낱말 · 눌러서 들어요</p>
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
          <div className="dots" aria-label={`${page + 1} / ${st.pages.length}쪽`}>
            {st.pages.map((_, i) => (
              <i key={i} className={i === page ? 'on' : ''} />
            ))}
          </div>
          <div className="controls">
            <button className="round" aria-label="이전 쪽" disabled={page === 0} onClick={() => go(-1)}>‹</button>
            <button className="play" onClick={readAloud}>
              {speaking ? `■ ${ui.stop}` : `▶ ${ui.listen} · 듣기`}
            </button>
            <button className={`round${last ? ' go' : ''}`} aria-label={last ? '다 읽었어요' : '다음 쪽'} onClick={() => go(1)}>
              {last ? '✓ 끝' : '다음 ›'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
