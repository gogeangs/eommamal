import { ICON, V, WORD_ART, langById } from '../content';
import { svg } from '../content/art.js';
import { useProgress } from '../lib/progress';
import { hasVoice, speak } from '../lib/speech';
import { useNav, type HomeTab } from '../nav';
import type { ReactNode } from 'react';
import type { Page } from '../content/types';
import { WORD_BG, WORD_IMG, assetUrl } from '../content/pack';
import type { LangId } from '../content';
import { t } from '../lib/childUi';

/**
 * A two-language label: the child's language first, Korean underneath (or beside it with `row`).
 * Use this instead of "모국어 · 한국어" strings so long labels never wrap mid-phrase.
 */
export function Bi({ mo, ko, row = false }: { mo: ReactNode; ko: ReactNode; row?: boolean }) {
  const { p } = useProgress();
  return (
    <span className={`bi${row ? ' row' : ''}`}>
      <span lang={p.lang}>{mo}</span>
      <small lang="ko">{ko}</small>
    </span>
  );
}

/** A story picture: the finished illustration when there is one, else the drawn SVG placeholder. */
export function Scene({ page, className = 'panel', alt = '' }: { page: Page; className?: string; alt?: string }) {
  if (page.img) {
    return (
      <div className={className}>
        <img src={assetUrl(page.img)} alt={alt} decoding="async" />
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
  const img = WORD_IMG[id] ?? (WORD_ART[id] ? `images/words/${id}.webp` : null);
  if (img) {
    return (
      <span className={`tile art${dim ? ' dim' : ''}`} style={{ background: WORD_BG[id] ?? WORD_ART[id] ?? V[id]?.bg }}>
        <img src={assetUrl(img)} alt="" decoding="async" />
      </span>
    );
  }
  if (!ICON[id]) {
    // A word added without a picture yet: show its first syllable.
    return <span className={`tile text${dim ? ' dim' : ''}`} style={{ background: V[id]?.bg ?? '#EAF2F7' }}><b>{V[id]?.ko.slice(0, 2)}</b></span>;
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
/**
 * Words whose "translation" is just the Korean word spelled in Latin letters (songpyeon, hanbok, yunnori…).
 * A foreign voice reads the spelling with its own rules ("song-pie-on"), which teaches the wrong sound,
 * so for these only the Korean voice speaks. The written word on screen stays as it is.
 */
const KOREAN_LOANWORDS: Record<string, LangId[]> = {
  songpyeon: ['en', 'vi', 'uz'],
  hanbok: ['en', 'vi', 'uz'],
  yut: ['en', 'vi', 'uz'],
  tteokguk: ['uz'],
};

export function useSayWord() {
  const { p } = useProgress();
  return (id: string) => {
    const tts = langById(p.lang).tts;
    const items = [{ text: V[id].ko, lang: 'ko-KR', rate: 0.7 }];
    const loan = KOREAN_LOANWORDS[id]?.includes(p.lang);
    if (hasVoice(tts) && !loan) items.push({ text: V[id][p.lang], lang: tts, rate: 0.85 });
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

/** Small down-chevron for things that open a list or a panel. */
export function Chevron() {
  return <svg className="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>;
}

export function TopBar({ label, quit = false, grown = false, tab = 'books', replace = false, children }: { label?: ReactNode; quit?: boolean; grown?: boolean; tab?: HomeTab; replace?: boolean; children?: ReactNode }) {
  const nav = useNav();
  const { p } = useProgress();
  const text = label ?? (quit
    ? <><span className="ico" aria-hidden="true">✕</span><Bi row mo={t(p.lang, 'quit')} ko="그만하기" /></>
    : <><svg className="back-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4.5 7.5 12l7.5 7.5" /></svg>{grown ? <span lang={p.lang}>{t(p.lang, 'home')}</span> : <Bi row mo={t(p.lang, 'home')} ko="책장" />}</>);
  return (
    <div className="top">
      <button className="ghost back" onClick={() => nav({ view: 'home', tab }, { replace })}>
        {text}
      </button>
      {children}
    </div>
  );
}

export function Progress({ label, i, n }: { label: ReactNode; i: number; n: number }) {
  return (
    <>
      <div className="row">
        <p className="label">{label}</p>
        <p className="label count">
          {Math.min(i + 1, n)} / {n}
        </p>
      </div>
      <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={n} aria-valuenow={Math.min(i + 1, n)}>
        <i style={{ width: `${((i + 1) / Math.max(n, 1)) * 100}%` }} />
      </div>
    </>
  );
}
