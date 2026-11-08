import { useEffect, useRef, useState } from 'react';
import { UI, V, findStory, langById, splitKorean } from '../content';
import { Scene, Tile, TopBar, useSayWord } from '../components/ui';
import { useProgress, type ReadMode } from '../lib/progress';
import { hasVoice, speak, speechSupported, stopSpeaking, type SpeechItem } from '../lib/speech';
import { useNav } from '../nav';

export function Reader({ storyId }: { storyId: string }) {
  const { p, set } = useProgress();
  const nav = useNav();
  const say = useSayWord();
  const st = findStory(storyId);
  const start = p.pages[st.id] ?? 0;
  const [page, setPage] = useState(start < st.pages.length ? start : 0);
  const [speaking, setSpeaking] = useState(false);
  const [voiceNote, setVoiceNote] = useState('');
  const lang = langById(p.lang);
  const ui = UI[p.lang];
  const pg = st.pages[page];
  const last = page === st.pages.length - 1;
  const showMother = p.mode !== 'ko';
  const showKorean = p.mode !== 'mo';

  useEffect(() => {
    set('pages', { ...p.pages, [st.id]: page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);
  useEffect(() => () => stopSpeaking(), []);

  const go = (d: number) => {
    stopSpeaking();
    setSpeaking(false);
    setVoiceNote('');
    if (d > 0 && last) {
      set('pages', { ...p.pages, [st.id]: 0 });
      nav({ view: 'done', story: st.id });
      return;
    }
    setPage((x) => Math.max(0, Math.min(st.pages.length - 1, x + d)));
  };

  const readAloud = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    if (!speechSupported()) {
      setVoiceNote('이 브라우저에서는 소리 내어 읽기를 쓸 수 없어요.');
      return;
    }
    const q: SpeechItem[] = [];
    if (showMother) {
      if (hasVoice(lang.tts)) q.push({ text: pg[p.lang], lang: lang.tts, highlightId: 'tm' });
      else setVoiceNote(`이 휴대폰에는 ${lang.ko} 음성이 없어서 한국어만 읽어요.`);
    }
    if (showKorean) q.push({ text: pg.ko, lang: 'ko-KR', highlightId: 'tk' });
    if (!q.length) return;
    setSpeaking(true);
    speak(q, () => setSpeaking(false));
  };

  // Swipe on the picture to turn pages.
  const x0 = useRef<number | null>(null);

  const setMode = (m: ReadMode) => {
    stopSpeaking();
    setSpeaking(false);
    set('mode', m);
  };

  return (
    <>
      <TopBar>
        <div className="seg" role="group" aria-label="보기 방식">
          <button aria-pressed={p.mode === 'both'} onClick={() => setMode('both')}>함께</button>
          <button aria-pressed={p.mode === 'mo'} onClick={() => setMode('mo')}>{lang.ko}</button>
          <button aria-pressed={p.mode === 'ko'} onClick={() => setMode('ko')}>한국어</button>
        </div>
      </TopBar>
      <div>
        <h2 lang={p.lang}>{st.title[p.lang]}</h2>
        <p className="lead" style={{ margin: '2px 0 0' }}>{st.title.ko}</p>
      </div>
      <div
        onTouchStart={(e) => (x0.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (x0.current == null) return;
          const d = e.changedTouches[0].clientX - x0.current;
          if (Math.abs(d) > 50) go(d < 0 ? 1 : -1);
          x0.current = null;
        }}
      >
        <Scene key={page} page={pg} alt={pg.ko} />
      </div>
      <div className="text">
        {showMother && (
          <p className="mother" id="tm" lang={p.lang}>{pg[p.lang]}</p>
        )}
        {showKorean && (
          <p className={`korean${showMother ? '' : ' solo'}`} id="tk" lang="ko">
            {showMother && <span className="tag">한국어</span>}
            {splitKorean(pg.ko).map((part, i) =>
              part.word ? (
                <button key={i} className="w" onClick={() => say(part.word!)}>{part.text}</button>
              ) : (
                <span key={i}>{part.text}</span>
              ),
            )}
          </p>
        )}
      </div>
      <section>
        <p className="label">이 쪽의 낱말 · 눌러서 들어요</p>
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
          {last ? '✓' : '›'}
        </button>
      </div>
      <p className="voice">{voiceNote}</p>
    </>
  );
}
