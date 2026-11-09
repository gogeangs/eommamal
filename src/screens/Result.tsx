import { useEffect } from 'react';
import { t } from '../lib/childUi';
import { UI, type Story } from '../content';
import { Illus, TopBar, WordCard } from '../components/ui';
import { useProgress } from '../lib/progress';
import { useNav } from '../nav';

export function Result({ story, kind, stars, words, onRetry }: {
  story: Story;
  kind: 'quiz' | 'dict' | 'sent';
  stars: number;
  words: string[];
  onRetry: () => void;
}) {
  const { p, bestScore } = useProgress();
  const nav = useNav();
  const n = words.length;
  const isDict = kind === 'dict';
  const isSent = kind === 'sent';

  useEffect(() => {
    if (!isSent) bestScore(isDict ? 'dictStars' : 'quizStars', story.id, stars);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <TopBar />
      <header className="stack result-head">
        <Illus name="celebrate" className="illus celebrate-art" />
        <p className="stars" aria-label="오늘도 잘했어요">★</p>
        <h1>{t(p.lang,'wellDone')} · {isSent ? '문장을 순서대로 놓았어요!' : `오늘 낱말 ${n}개를 만났어요!`}</h1>
        <p className="lead">{isSent ? `혼자 완성한 문장 ${stars}개` : `혼자 찾은 낱말 ${stars}개`}</p>
        <p className="lead" lang={p.lang}>{UI[p.lang].ok}</p>
      </header>
      <section>
        <p className="label">{isSent ? '문장 속 낱말' : isDict ? '받아쓰기한 낱말' : '낱말장에 모은 낱말'}</p>
        <div className="wbook">{words.map((id) => <WordCard key={id} id={id} />)}</div>
      </section>
      <div className="stack">
        <button className="play" onClick={() => nav(isSent ? {view:'home',tab:'words'} : isDict ? {view:'sent',story:story.id} : {view:'trace',story:story.id})}>{isSent ? `${t(p.lang,'words')} · 내 낱말 보기` : isDict ? `다음 · 문장 받아쓰기 ▶` : '다음 · 따라 쓰기 ▶'}</button>
        <button className="btn2" onClick={onRetry}>{t(p.lang,'retry')} · 다시 해 보기</button>
        <button className="btn2" onClick={() => nav({ view: 'home' })}>책장으로</button>
      </div>
    </>
  );
}
