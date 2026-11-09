import { ASK, CULTURE, UI, findStory, langById } from '../content';
import { TopBar, WordCard } from '../components/ui';
import { useProgress } from '../lib/progress';
import { hasVoice, speak, type SpeechItem } from '../lib/speech';
import { useNav } from '../nav';

/** Compares Korean New Year with the learner's own culture, in both languages. */
function CultureCard() {
  const { p } = useProgress();
  const c = CULTURE[p.lang];
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
      <img className="culture-art" src={`${import.meta.env.BASE_URL}images/culture/${p.lang}.webp`} alt="" decoding="async" />
      <span className="ctag">문화 비교</span>
      <div>
        <h2 id="ch" lang={p.lang}>{c.head}</h2>
        <p className="lead" style={{ margin: '2px 0 0' }}>{c.place}의 새해는 어떨까요?</p>
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
        <p className="mo" lang={p.lang}>{ASK[p.lang]}</p>
        <p className="k">우리 집은 새해를 어떻게 보내요? 엄마 아빠에게 물어봐요!</p>
      </div>
    </section>
  );
}

export function Done({ storyId }: { storyId: string }) {
  const { p } = useProgress();
  const nav = useNav();
  const st = findStory(storyId);
  return (
    <>
      <TopBar />
      <header>
        <h1>다 읽었어요!</h1>
        <p className="lead" lang={p.lang}>{st.title[p.lang]} · {UI[p.lang].ok}</p>
      </header>
      {st.culture && <CultureCard />}
      <section>
        <p className="label">이 책에서 만난 낱말 · 눌러서 들어요</p>
        <div className="wbook">
          {st.words.map((id) => <WordCard key={id} id={id} />)}
        </div>
      </section>
      <div className="stack">
        <button className="play" onClick={() => nav({ view: 'quiz', story: st.id })}>낱말 놀이 시작 · {st.words.length}문제</button>
        <button className="btn2" onClick={() => nav({ view: 'trace', story: st.id })}>✍ 따라 쓰기 · 획순</button>
        <button className="btn2" onClick={() => nav({ view: 'dict', story: st.id })}>✎ 받아쓰기</button>
        <button className="btn2" onClick={() => nav({ view: 'read', story: st.id })}>처음부터 다시 읽기</button>
      </div>
    </>
  );
}
