import { ICON, V, langById } from '../content';
import { svg } from '../content/art.js';
import { useProgress } from '../lib/progress';
import { hasVoice, speak } from '../lib/speech';
import { useNav } from '../nav';
import type { ReactNode } from 'react';

/** A full 320x220 story illustration. Content is our own static SVG markup. */
export function Scene({ art, className = 'panel' }: { art: string; className?: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: svg(art) }} />;
}

/** Square picture for a vocabulary word. */
export function Tile({ id, dim = false }: { id: string; dim?: boolean }) {
  const [draw, viewBox] = ICON[id];
  return (
    <span
      className={`tile${dim ? ' dim' : ''}`}
      style={{ background: V[id].bg }}
      dangerouslySetInnerHTML={{ __html: `<svg viewBox="${viewBox}" aria-hidden="true">${draw()}</svg>` }}
    />
  );
}

/** Says a word in Korean, then in the learner's language when the device has that voice. */
export function useSayWord() {
  const { p } = useProgress();
  return (id: string) => {
    const tts = langById(p.lang).tts;
    const items = [{ text: V[id].ko, lang: 'ko-KR', rate: 0.7 }];
    if (hasVoice(tts)) items.push({ text: V[id][p.lang], lang: tts, rate: 0.85 });
    speak(items);
  };
}

export function WordCard({ id }: { id: string }) {
  const { p } = useProgress();
  const say = useSayWord();
  return (
    <button className="wcard" onClick={() => say(id)}>
      <Tile id={id} />
      <b>
        {V[id].ko}
        {p.written.includes(id) && (
          <>
            {' '}
            <span className="badge" aria-label="받아쓰기 완료">✎</span>
          </>
        )}
      </b>
      <span lang={p.lang}>{V[id][p.lang]}</span>
    </button>
  );
}

export function TopBar({ label = '‹ 책장', children }: { label?: string; children?: ReactNode }) {
  const nav = useNav();
  return (
    <div className="top">
      <button className="ghost" onClick={() => nav({ view: 'home' })}>
        {label}
      </button>
      {children}
    </div>
  );
}

export function Progress({ label, i, n }: { label: string; i: number; n: number }) {
  return (
    <>
      <div className="row">
        <p className="label">{label}</p>
        <p className="label">
          {Math.min(i + 1, n)} / {n}
        </p>
      </div>
      <div className="bar">
        <i style={{ width: `${(i / n) * 100}%` }} />
      </div>
    </>
  );
}
