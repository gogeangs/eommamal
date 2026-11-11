import { useEffect, useMemo, useRef, useState } from 'react';
import { t } from '../lib/childUi';
import { STORIES, SESSION, UI, V, findStory, shuffle } from '../content';
import { Bi, Progress, Tile, TopBar } from '../components/ui';
import { useProgress } from '../lib/progress';
import { speak } from '../lib/speech';
import { Result } from './Result';

interface Phrase { ko: string; w: string }
interface Round extends Phrase { parts: string[]; cards: string[] }

const sayKo = (text: string, rate = 0.75) => speak([{ text, lang: 'ko-KR', rate }]);
const squash = (s: string) => s.normalize('NFC').replace(/\s+/g, '');

/** Phrases for a story, or for every story when practising all words. */
function phrasesFor(storyId: string): Phrase[] {
  if (storyId === 'all') return STORIES.flatMap((s) => s.phrases ?? []);
  return findStory(storyId).phrases ?? [];
}

function makeRounds(all: Phrase[], done: string[]): Round[] {
  const fresh = shuffle(all.filter((x) => !done.includes(x.ko)));
  const old = shuffle(all.filter((x) => done.includes(x.ko)));
  const picked = [...fresh, ...old].slice(0, SESSION);
  const pool = [...new Set(all.flatMap((x) => x.ko.split(' ')))];
  return shuffle(picked).map((x) => {
    const parts = x.ko.split(' ');
    // One or two decoy word cards so the child has to listen, not just tap everything.
    const decoys = shuffle(pool.filter((c) => !parts.includes(c))).slice(0, parts.length > 2 ? 2 : 1);
    return { ...x, parts, cards: shuffle(parts.concat(decoys)) };
  });
}

/**
 * Sentence dictation (stage 2): hear a short phrase and build it from word cards
 * in the right order, or type it with the keyboard. Spacing is not graded.
 */
export function Sentence({ storyId }: { storyId: string }) {
  const { p, set, addWord } = useProgress();
  const st = findStory(storyId);
  const all = useMemo(() => phrasesFor(storyId), [storyId]);
  const [seed, setSeed] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const rounds = useMemo(() => makeRounds(all, p.sentences), [all, seed]);
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
  const r = rounds[i];
  const blocks = p.dictMode === 'blocks';

  useEffect(() => {
    if (!r) return;
    const tm = setTimeout(() => sayKo(r.ko), 250);
    return () => clearTimeout(tm);
  }, [r]);

  if (!all.length) {
    return (
      <>
        <TopBar quit tab="study" replace />
        <p className="lead">이 이야기에는 아직 문장 받아쓰기가 없어요.</p>
      </>
    );
  }

  if (!r) {
    return (
      <Result
        story={st}
        kind="sent"
        stars={stars}
        words={[...new Set(rounds.map((x) => x.w))].filter((w) => V[w])}
        onRetry={() => { setSeed((s) => s + 1); setI(0); setStars(0); }}
      />
    );
  }

  const next = () => {
    setI((x) => x + 1);
    setFilled([]); setTyped(''); setHint(false); setMiss(0); setMsg(''); setDone(false);
  };

  const check = (answer: string) => {
    if (squash(answer) === squash(r.ko)) {
      setDone(true);
      if (miss === 0 && !hint) setStars((s) => s + 1);
      addWord('sentences', r.ko);
      setMsg(`${r.ko} — ${t(p.lang, 'wellDone')}`);
      sayKo(r.ko);
      return;
    }
    const m = miss + 1;
    setMiss(m);
    setShake((s) => s + 1);
    if (m >= 3) setHint(true);
    setMsg(m >= 3 ? `정답은 “${r.ko}”예요. 순서대로 놓아 볼까요?` : `${t(p.lang, 'retry')} · 순서를 다시 들어 볼까요?`);
    if (blocks) setFilled([]); else inputRef.current?.select();
    sayKo(r.ko);
  };

  const tap = (k: number) => {
    if (done || filled.length >= r.parts.length) return;
    const f = [...filled, k];
    setFilled(f);
    if (f.length === r.parts.length) check(f.map((x) => r.cards[x]).join(' '));
  };

  const shakeClass = shake ? (shake % 2 ? ' shake' : ' shake2') : '';

  return (
    <>
      <TopBar quit tab="study" replace />
      <Progress label={<Bi row mo={t(p.lang, 'sentence')} ko="문장 받아쓰기" />} i={i} n={rounds.length} />

      <section className="stack">
        <p className="qtitle"><Bi mo={t(p.lang, 'sentence')} ko="잘 듣고 순서대로 놓아요" /></p>
        <p className="lead">낱말 {r.parts.length}개로 된 문장이에요</p>
        <div className="listen">
          <button className="play" onClick={() => sayKo(r.ko)}><span className="ico" aria-hidden="true">▶</span><Bi mo={UI[p.lang].listen} ko="듣기" /></button>
          {miss > 0 && <button className="btn2" onClick={() => sayKo(r.ko, 0.45)}><Bi mo={t(p.lang, 'listenAgain')} ko="천천히 듣기" /></button>}
        </div>
        {hint ? (
          <div className="hint">
            <Tile id={r.w} />
            <b lang={p.lang}>{V[r.w]?.[p.lang]}</b>
          </div>
        ) : miss >= 2 ? (
          <button className="btn2" onClick={() => setHint(true)}><Bi mo={t(p.lang, 'hint')} ko="그림 보기" /></button>
        ) : null}
      </section>

      {blocks ? (
        <>
          <div className={`sent-slots${done ? ' right' : ''}${shakeClass}`} aria-label="문장 칸">
            {r.parts.map((_, k) => (
              <button
                key={k}
                className={`sent-slot${filled[k] != null ? ' full' : ''}`}
                aria-label={filled[k] != null ? `${k + 1}번째: ${r.cards[filled[k]]}. 눌러서 빼기` : `${k + 1}번째 칸`}
                onClick={() => !done && filled[k] != null && setFilled(filled.slice(0, k))}
              >
                {filled[k] != null ? r.cards[filled[k]] : ''}
              </button>
            ))}
          </div>
          <div className="sent-cards">
            {r.cards.map((c, k) => (
              <button key={k} className="sent-card" disabled={filled.includes(k) || done} onClick={() => tap(k)}>{c}</button>
            ))}
          </div>
          {!done && (
            <div className="tools">
              <button className="ghost" onClick={() => setFilled(filled.slice(0, -1))}><span className="ico" aria-hidden="true">⌫</span><Bi row mo={t(p.lang, 'erase')} ko="하나 빼기" /></button>
              <button className="ghost" onClick={() => setFilled([])}><Bi row mo={t(p.lang, 'clear')} ko="모두 빼기" /></button>
            </div>
          )}
        </>
      ) : (
        <form
          className={`kb${done ? ' right' : ''}${shakeClass}`}
          onSubmit={(e) => { e.preventDefault(); if (!done && typed.trim()) check(typed); }}
        >
          <input
            ref={inputRef}
            lang="ko"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="들은 문장 쓰기"
            placeholder="들은 문장을 써요"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
          />
          <button className="play" type="submit"><Bi mo={t(p.lang, 'check')} ko="확인" /></button>
        </form>
      )}
      <p className="fb" aria-live="polite" style={{ color: miss && !done ? 'var(--muted)' : undefined }}>{msg}</p>
      <details className="dict-options at-end"><summary>쓰기 방법 선택</summary><div className="seg dmode" role="group" aria-label="쓰는 방법">
        <button aria-pressed={blocks} onClick={() => { set('dictMode', 'blocks'); setFilled([]); }}>낱말 카드</button>
        <button aria-pressed={!blocks} onClick={() => { set('dictMode', 'keys'); setFilled([]); }}>자판으로 쓰기</button>
      </div></details>
      {done && <button className="play next-round" onClick={next}><Bi mo={t(p.lang, 'next')} ko="다음" /><span className="ico" aria-hidden="true">▶</span></button>}
    </>
  );
}
