import { useEffect } from 'react';
import { t } from '../lib/childUi';
import { SESSION, UI, type Story } from '../content';
import { Illus, TopBar, WordCard } from '../components/ui';
import { useProgress } from '../lib/progress';
import { useNav } from '../nav';

export function Result({ story, kind, stars, words, onRetry }: {
  story: Story;
  kind: 'quiz' | 'dict';
  stars: number;
  words: string[];
  onRetry: () => void;
}) {
  const { p, bestScore } = useProgress();
  const nav = useNav();
  const n = words.length;
  const isDict = kind === 'dict';

  useEffect(() => {
    bestScore(isDict ? 'dictStars' : 'quizStars', story.id, stars);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <TopBar />
      <header className="stack result-head">
        <Illus name="celebrate" className="illus celebrate-art" />
        <p className="stars" aria-label={`혼자 찾은 낱말 ${stars}개`}>{'★'.repeat(Math.max(1, stars))}</p>
        <h1>{t(p.lang,'wellDone')} · 오늘 낱말 {n}개를 만났어요!</h1>
        <p className="lead">혼자 찾은 낱말 {stars}개</p>
        <p className="lead" lang={p.lang}>{UI[p.lang].ok}</p>
      </header>
      <section>
        <p className="label">{isDict ? '받아쓰기한 낱말' : '낱말장에 모은 낱말'}</p>
        <div className="wbook">{words.map((id) => <WordCard key={id} id={id} />)}</div>
      </section>
      <div className="stack">
        <button className="play" onClick={() => nav({view: isDict ? 'home' : 'trace', ...(!isDict ? {story:story.id} : {tab:'words' as const})})}>{isDict ? `${t(p.lang,'words')} · 내 낱말 보기` : '다음 · 따라 쓰기 ▶'}</button>
        <button className="btn2" onClick={onRetry}>{t(p.lang,'retry')} · 다시 해 보기</button>
        <button className="btn2" onClick={() => nav({ view: 'home' })}>책장으로</button>
      </div>
    </>
  );
}
