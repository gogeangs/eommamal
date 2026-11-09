import { useEffect, useMemo, useRef, useState } from 'react';
import { ALL_WORDS, UI, V, findStory, langById, pickSession, shuffle, syllables } from '../content';
import { Progress, Tile, TopBar } from '../components/ui';
import { useProgress } from '../lib/progress';
import { speak } from '../lib/speech';
import { Result } from './Result';

interface Round { w: string; blocks: string[] }

const EXTRA = ['가', '나', '다', '리', '모', '수', '소', '기', '오', '하'];

function makeRounds(words: string[]): Round[] {
  const pool = [...new Set(ALL_WORDS.flatMap((id) => syllables(V[id].ko)).concat(EXTRA))];
  return shuffle(words).map((w) => {
    const t = syllables(V[w].ko);
    const extra = shuffle(pool.filter((c) => !t.includes(c))).slice(0, 6 - t.length);
    return { w, blocks: shuffle(t.concat(extra)) };
  });
}

const sayKo = (text: string, rate = 0.75) => speak([{ text, lang: 'ko-KR', rate }]);

/** Dictation: hear a word and spell it with letter blocks or the keyboard. */
export function Dictation({ storyId }: { storyId: string }) {
  const { p, set, addWord } = useProgress();
  const st = findStory(storyId);
  const [seed, setSeed] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const rounds = useMemo(() => makeRounds(pickSession(st.words, p.written)), [st, seed]);
  const [i, setI] = useState(0);
  const [stars, setStars] = useState(0);
  const [filled, setFilled] = useState<number[]>([]);
  const [typed, setTyped] = useState('');
  const [hint, setHint] = useState(false);
  const [miss, setMiss] = useState(0);
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState(false);
  const [shake, setShake] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const ui = UI[p.lang];
  const r = rounds[i];
  const blocks = p.dictMode === 'blocks';

  useEffect(() => {
    if (!r) return;
    const t = setTimeout(() => sayKo(V[r.w].ko), 250);
    return () => clearTimeout(t);
  }, [r]);

  if (!r) {
    return (
      <Result
        story={st}
        kind="dict"
        stars={stars}
        words={rounds.map((x) => x.w)}
        onRetry={() => { setSeed((s) => s + 1); setI(0); setStars(0); }}
      />
    );
  }

  const target = syllables(V[r.w].ko);

  const next = () => {
    setI((x) => x + 1);
    setFilled([]);
    setTyped('');
    setHint(false);
    setMiss(0);
    setMsg('');
    setDone(false);
  };

  const check = (answer: string) => {
    const word = V[r.w].ko;
    if (answer === word) {
      setDone(true);
      if (miss === 0 && !hint) setStars((s) => s + 1);
      addWord('written', r.w);
      addWord('learned', r.w);
      setMsg(`${word} · ${V[r.w][p.lang]} — ${ui.ok}`);
      sayKo(word);
      setTimeout(next, 1400);
    } else {
      const m = miss + 1;
      setMiss(m);
      setShake((s) => s + 1);
      setMsg(m >= 3 ? `정답은 “${word}”예요. 따라 써 볼까요?` : `“${answer}”이(가) 아니에요. 다시 들어 볼까요?`);
      if (blocks) setFilled([]);
      else inputRef.current?.select();
    }
  };

  const tapBlock = (b: number) => {
    if (done || filled.length >= target.length) return;
    const f = [...filled, b];
    setFilled(f);
    if (f.length === target.length) check(f.map((x) => r.blocks[x]).join(''));
  };

  const shakeClass = shake ? (shake % 2 ? ' shake' : ' shake2') : '';

  return (
    <>
      <TopBar label="✕ 그만하기" tab="study" replace />
      <Progress label="받아쓰기" i={i} n={rounds.length} />
      <div className="seg dmode" role="group" aria-label="쓰는 방법">
        <button aria-pressed={blocks} onClick={() => { set('dictMode', 'blocks'); setFilled([]); }}>글자 블록</button>
        <button aria-pressed={!blocks} onClick={() => { set('dictMode', 'keys'); setFilled([]); }}>자판으로 쓰기</button>
      </div>
      <section className="stack">
        <p className="qtitle">잘 듣고 써 봐요</p>
        <p className="lead">{target.length}글자 낱말이에요</p>
        <div className="listen">
          <button className="play" onClick={() => sayKo(V[r.w].ko)}>▶ 듣기</button>
          <button className="btn2" onClick={() => sayKo(V[r.w].ko, 0.45)}>천천히 듣기</button>
        </div>
        {hint ? (
          <div className="hint">
            <Tile id={r.w} />
            <b lang={p.lang}>{V[r.w][p.lang]}</b>
          </div>
        ) : (
          <button className="btn2" onClick={() => setHint(true)}>
            힌트 · 그림과 {langById(p.lang).ko} 뜻 보기
          </button>
        )}
      </section>

      {blocks ? (
        <>
          <div className={`slots${done ? ' right' : ''}${shakeClass}`}>
            {target.map((_, k) => (
              <button
                key={k}
                className={`slot${filled[k] != null ? ' full' : ''}`}
                aria-label={`${k + 1}번째 칸`}
                onClick={() => !done && filled[k] != null && setFilled(filled.slice(0, k))}
              >
                {filled[k] != null ? r.blocks[filled[k]] : ''}
              </button>
            ))}
          </div>
          <div className="blocks">
            {r.blocks.map((c, k) => (
              <button key={k} className="blk" disabled={filled.includes(k)} onClick={() => tapBlock(k)}>{c}</button>
            ))}
          </div>
          <div className="tools">
            <button className="ghost" onClick={() => !done && setFilled(filled.slice(0, -1))}>⌫ 지우기</button>
            <button className="ghost" onClick={() => !done && setFilled([])}>모두 지우기</button>
          </div>
        </>
      ) : (
        <form
          className={`kb${done ? ' right' : ''}${shakeClass}`}
          onSubmit={(e) => {
            e.preventDefault();
            const v = typed.trim().normalize('NFC');
            if (!done && v) check(v);
          }}
        >
          <input
            ref={inputRef}
            lang="ko"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="들은 낱말 쓰기"
            placeholder="여기에 써요"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
          />
          <button className="play" type="submit">확인</button>
        </form>
      )}
      <p className="fb" style={{ color: miss && !done ? 'var(--muted)' : undefined }}>{msg}</p>
    </>
  );
}
