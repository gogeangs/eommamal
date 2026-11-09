import { ICON, V, WORD_ART, langById } from '../content';
import { svg } from '../content/art.js';
import { useProgress } from '../lib/progress';
import { hasVoice, speak } from '../lib/speech';
import { useNav, type HomeTab } from '../nav';
import type { ReactNode } from 'react';
import type { Page } from '../content/types';

/** A story picture: the finished illustration when there is one, else the drawn SVG placeholder. */
export function Scene({ page, className = 'panel', alt = '' }: { page: Page; className?: string; alt?: string }) {
  if (page.img) {
    return (
      <div className={className}>
        <img src={import.meta.env.BASE_URL + page.img} alt={alt} decoding="async" />
      </div>
    );
  }
  return <div className={className} dangerouslySetInnerHTML={{ __html: svg(page.art()) }} />;
}

/** A finished screen illustration from public/images/ui (decorative). */
export function Illus({ name, className = 'illus' }: { name: string; className?: string }) {
  return <img className={className} src={`${import.meta.env.BASE_URL}images/ui/${name}.webp`} alt="" decoding="async" />;
}

/** Square picture for a vocabulary word. */
export function Tile({ id, dim = false }: { id: string; dim?: boolean }) {
  if (WORD_ART[id]) {
    return (
      <span className={`tile art${dim ? ' dim' : ''}`} style={{ background: WORD_ART[id] }}>
        <img src={`${import.meta.env.BASE_URL}images/words/${id}.webp`} alt="" decoding="async" />
      </span>
    );
  }
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

export function TopBar({ label = '‹ 책장', tab = 'books', children }: { label?: string; tab?: HomeTab; children?: ReactNode }) {
  const nav = useNav();
  return (
    <div className="top">
      <button className="ghost" onClick={() => nav({ view: 'home', tab })}>
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
