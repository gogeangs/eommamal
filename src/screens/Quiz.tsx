import { useEffect, useMemo, useState } from 'react';
import { t } from '../lib/childUi';
import { ALL_WORDS, UI, V, findStory, looksAlike, pickSession, shuffle } from '../content';
import { Progress, Tile, TopBar } from '../components/ui';
import { useProgress } from '../lib/progress';
import { speak } from '../lib/speech';
import { Result } from './Result';

interface Round { w: string; type: 'listen' | 'see'; opts: string[] }

const makeRounds = (words: string[]): Round[] =>
  shuffle(words).map((w, i) => ({
    w,
    type: i % 2 ? 'see' : 'listen',
    opts: shuffle([w, ...shuffle(ALL_WORDS.filter((x) => x !== w && !looksAlike(x, w))).slice(0, 2)]),
  }));

const sayKo = (id: string) => speak([{ text: V[id].ko, lang: 'ko-KR', rate: 0.7 }]);

/** Word game: hear a word and pick the picture, or see a picture and pick the Korean word. */
export function Quiz({ storyId }: { storyId: string }) {
  const { p, addWord } = useProgress();
  const st = findStory(storyId);
  const [seed, setSeed] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const rounds = useMemo(() => makeRounds(pickSession(st.words, p.learned)), [st, seed]);
  const [i, setI] = useState(0);
  const [stars, setStars] = useState(0);
  const [tried, setTried] = useState(false);
  const [wrong, setWrong] = useState<string[]>([]);
  const [right, setRight] = useState<string | null>(null);
  const [readyNext, setReadyNext] = useState(false);
  const ui = UI[p.lang];
  const r = rounds[i];

  useEffect(() => {
    if (r?.type === 'listen') {
      const t = setTimeout(() => sayKo(r.w), 250);
      return () => clearTimeout(t);
    }
  }, [r]);

  if (!r) {
    return (
      <Result
        story={st}
        kind="quiz"
        stars={stars}
        words={rounds.map((x) => x.w)}
        onRetry={() => { setSeed((s) => s + 1); setI(0); setStars(0); }}
      />
    );
  }

  const choose = (id: string) => {
    if (right) return;
    if (id === r.w) {
      setRight(id);
      if (!tried) setStars((s) => s + 1);
      addWord('learned', id);
      sayKo(id);
      setReadyNext(true);
      // The child moves on with the 'next' button, at their own pace.
    } else {
      setWrong((w) => [...w, id]);
      setTried(true);
      // Children who can't read yet need to hear the word again, not just see a shake.
      setTimeout(() => sayKo(r.w), 350);
    }
  };

  return (
    <>
      <TopBar label="✕ 그만하기" tab="study" replace />
      <Progress label="낱말 놀이" i={i} n={rounds.length} />
      <section className="stack">
        {r.type === 'listen' ? (
          <>
            <p className="qtitle">{t(p.lang,'choose')}</p>
            <p className="lead" lang={p.lang}>{ui.lp}</p>
            <button className="btn2" onClick={() => sayKo(r.w)}>▶ 다시 듣기</button>
          </>
        ) : (
          <>
            <p className="qtitle">한국어 낱말을 골라요</p>
            <p className="lead" lang={p.lang}>{ui.sp}</p>
            <div className="qpic">
              <Tile id={r.w} />
              <b lang={p.lang}>{V[r.w][p.lang]}</b>
            </div>
          </>
        )}
      </section>
      <div className="opts">
        {r.opts.map((id, n) => (
          <button
            key={id}
            className={`opt${right === id ? ' right' : ''}${wrong.includes(id) ? ' wrong' : ''}`}
            disabled={wrong.includes(id)}
            aria-label={r.type === 'listen' ? `${n + 1}번 그림` : V[id].ko}
            onClick={() => choose(id)}
          >
            {r.type === 'listen' ? <Tile id={id} /> : V[id].ko}
          </button>
        ))}
      </div>
      <p className="fb" aria-live="polite">
        {right ? `${V[r.w].ko} · ${V[r.w][p.lang]} — ${t(p.lang,'wellDone')}` : wrong.length ? `${t(p.lang,'retry')} · 다시 들어 보고 골라 볼까요?` : ''}
      </p>
      {readyNext && <button className="play next-round" onClick={() => {setI(x=>x+1);setTried(false);setWrong([]);setRight(null);setReadyNext(false);}}>{t(p.lang,'next')} · 다음 ▶</button>}
    </>
  );
}
