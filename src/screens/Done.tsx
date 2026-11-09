import { CULTURE, UI, findStory, langById } from '../content';
import { t } from '../lib/childUi';
import { Illus, TopBar, WordCard } from '../components/ui';
import { useProgress } from '../lib/progress';
import { hasVoice, speak, type SpeechItem } from '../lib/speech';
import { useNav } from '../nav';

/** Compares the Korean holiday in the story with the learner's own culture, in both languages. */
function CultureCard({ storyId }: { storyId: string }) {
  const { p } = useProgress();
  const set = CULTURE[storyId];
  const c = set.cards[p.lang];
  const tts = langById(p.lang).tts;
  const read = () => {
    const q: SpeechItem[] = [];
    const mother = hasVoice(tts);
    c.items.forEach(([m, k], i) => {
      if (mother) q.push({ text: m, lang: tts, highlightId: `cm${i}` });
      q.push({ text: k, lang: 'ko-KR', highlightId: `ck${i}` });
    });
    speak(q);
  };
  return (
    <section className="culture" aria-labelledby="ch">
      <img className="culture-art" src={`${import.meta.env.BASE_URL}images/culture/${set.img}${p.lang}.webp`} alt="" decoding="async"
        onError={(e) => { e.currentTarget.hidden = true; }} />
      <span className="ctag">문화 비교</span>
      <div>
        <h2 id="ch" lang={p.lang}>{c.head}</h2>
        <p className="lead" style={{ margin: '2px 0 0' }}>{c.place}{set.lead}</p>
      </div>
      <ol>
        {c.items.map(([m, k], i) => (
          <li key={i}>
            <i>{i + 1}</i>
            <div>
              <p className="mo" id={`cm${i}`} lang={p.lang}>{m}</p>
              <p className="k" id={`ck${i}`} lang="ko">{k}</p>
            </div>
          </li>
        ))}
      </ol>
      <button className="btn2 listen-c" onClick={read}>▶ {UI[p.lang].listen} · 듣기</button>
      <div className="ask">
        <p className="mo" lang={p.lang}>{set.ask[p.lang]}</p>
        <p className="k">{set.askKo}</p>
      </div>
    </section>
  );
}

const NEXT = [
  { view: 'quiz', name: '낱말 놀이' },
  { view: 'trace', name: '따라 쓰기' },
  { view: 'dict', name: '받아쓰기' },
] as const;

export function Done({ storyId }: { storyId: string }) {
  const { p } = useProgress();
  const nav = useNav();
  const st = findStory(storyId);
  return (
    <>
      <TopBar />
      <header>
        <h1>{t(p.lang,'wellDone')} · 다 읽었어요!</h1>
        <p className="lead" lang={p.lang}>{st.title[p.lang]} · {UI[p.lang].ok}</p>
      </header>
      <section className="next-acts" aria-label="이제 무엇을 할까요?">
        <button className="play" onClick={() => nav({view:'quiz',story:st.id})}>▶ {t(p.lang,'play')} · 낱말 놀이 시작</button>
        <p className="label" style={{ margin: 0 }}>이제 낱말을 익혀 볼까요?</p>
        <div className="next-grid">
          {NEXT.map((x, i) => (
            <button key={x.view} className={`next-card${i === 0 ? ' main' : ''}`} onClick={() => nav({ view: x.view, story: st.id })}>
              <Illus name={`act-${x.view}`} className="" />
              <b>{x.name}</b>
              <span>{i + 1}단계</span>
            </button>
          ))}
        </div>
      </section>
      {st.culture && CULTURE[st.id] && <CultureCard storyId={st.id} />}
      <section>
        <p className="label">이 책에서 만난 낱말 · 눌러서 들어요</p>
        <div className="wbook">
          {st.words.map((id) => <WordCard key={id} id={id} />)}
        </div>
      </section>
      <button className="btn2" onClick={() => nav({ view: 'read', story: st.id })}>처음부터 다시 읽기</button>
    </>
  );
}
