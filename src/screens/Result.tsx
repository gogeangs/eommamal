import { useEffect } from 'react';
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
        <p className="stars" aria-label={`별 ${stars}개`}>
          {'★'.repeat(stars)}
          <span className="off">{'★'.repeat(n - stars)}</span>
        </p>
        <h1>{stars === n ? '모두 한 번에 맞혔어요!' : `${n}개 중 ${stars}개를 한 번에 맞혔어요`}</h1>
        <p className="lead" lang={p.lang}>{UI[p.lang].ok}</p>
      </header>
      <section>
        <p className="label">{isDict ? '받아쓰기한 낱말' : '낱말장에 모은 낱말'}</p>
        <div className="wbook">{words.map((id) => <WordCard key={id} id={id} />)}</div>
      </section>
      <div className="stack">
        <button className="play" onClick={onRetry}>{story.words.length > SESSION ? (isDict ? '다른 낱말 6개 더 받아쓰기' : '다른 낱말 6개 더 놀이') : (isDict ? '받아쓰기 한 번 더' : '한 번 더 놀이')}</button>
        <button className="btn2" onClick={() => nav({ view: isDict ? 'quiz' : 'dict', story: story.id })}>
          {isDict ? '낱말 놀이 하기' : '✎ 받아쓰기 하기'}
        </button>
        <button className="btn2" onClick={() => nav({ view: 'home' })}>책장으로</button>
      </div>
    </>
  );
}
