import { ALL_WORDS, LANGS, STORIES, type Story } from '../content';
import { svg } from '../content/art.js';
import { Tile, WordCard } from '../components/ui';
import { useProgress } from '../lib/progress';
import { useNav } from '../nav';

function BookCard({ s, wide = false }: { s: Story; wide?: boolean }) {
  const { p } = useProgress();
  const nav = useNav();
  const q = p.quizStars[s.id];
  const d = p.dictStars[s.id];
  const info = (
    <>
      <b lang={p.lang}>{s.title[p.lang]}</b>
      <span>
        {s.title.ko} · {s.sub}
      </span>
      <em className="meta">
        {s.pages.length}쪽 · {q != null ? `★ ${q} / ${s.words.length}` : `낱말 ${s.words.length}개`}
        {d != null ? ` · ✎ ${d} / ${s.words.length}` : ''}
      </em>
    </>
  );
  return (
    <button className={`book${wide ? ' wide' : ''}`} onClick={() => nav({ view: 'read', story: s.id })}>
      <div className="cover" dangerouslySetInnerHTML={{ __html: svg(s.pages[0].art()) }} />
      {wide ? (
        <div>
          {s.culture && <span className="ctag">문화 비교 카드</span>}
          {info}
        </div>
      ) : (
        info
      )}
    </button>
  );
}

const ACTIVITIES = [
  { view: 'quiz', icon: '◎', name: '낱말 놀이', hint: '듣고 그림 고르기' },
  { view: 'trace', icon: '✍', name: '따라 쓰기', hint: '획순 연습' },
  { view: 'dict', icon: '✎', name: '받아쓰기', hint: '듣고 쓰기' },
] as const;

export function Home() {
  const { p, set } = useProgress();
  const nav = useNav();
  const scopes: [string, string][] = [['all', '모든 낱말'], ...STORIES.map((s): [string, string] => [s.id, s.title.ko])];

  return (
    <>
      <header>
        <h1>엄마말 그림책</h1>
        <p className="lead">엄마 아빠의 말로 읽고, 한국어 낱말을 모아요</p>
      </header>

      <section>
        <p className="label">우리 집 말을 골라요</p>
        <div className="chips">
          {LANGS.map((l) => (
            <button key={l.id} className="chip" aria-pressed={l.id === p.lang} onClick={() => set('lang', l.id)}>
              {l.name}
              <small>{l.ko}</small>
            </button>
          ))}
        </div>
      </section>

      <section>
        <p className="label">이야기</p>
        <div className="shelf">
          {STORIES.filter((s) => !s.culture).map((s) => (
            <BookCard key={s.id} s={s} />
          ))}
        </div>
      </section>

      <section>
        <p className="label">문화 이야기 · 한국과 우리 나라</p>
        {STORIES.filter((s) => s.culture).map((s) => (
          <BookCard key={s.id} s={s} wide />
        ))}
      </section>

      <section className="study">
        <p className="label" style={{ margin: 0 }}>
          바로 공부하기 · 책을 읽지 않아도 돼요
        </p>
        <div className="seg scope" role="group" aria-label="공부할 낱말">
          {scopes.map(([id, name]) => (
            <button key={id} aria-pressed={p.scope === id} onClick={() => set('scope', id)}>
              {name}
            </button>
          ))}
        </div>
        <div className="acts">
          {ACTIVITIES.map((a) => (
            <button key={a.view} className="act" onClick={() => nav({ view: a.view, story: p.scope })}>
              <i aria-hidden="true">{a.icon}</i>
              <b>{a.name}</b>
              <span>{a.hint}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="row">
          <p className="label">내 낱말장</p>
          <p className="label">
            {p.learned.length} / {ALL_WORDS.length}
          </p>
        </div>
        <div className="wbook">
          {ALL_WORDS.map((id) =>
            p.learned.includes(id) ? (
              <WordCard key={id} id={id} />
            ) : (
              <div key={id} className="wcard locked">
                <Tile id={id} dim />
                <b>?</b>
                <span>놀이로 모아요</span>
              </div>
            ),
          )}
        </div>
      </section>

      <p className="note">
        책을 읽고 나서 하거나, 위의 ‘바로 공부하기’에서 바로 시작할 수 있어요. 맞힌 낱말은 낱말장에 모이고, 받아쓰기까지
        마치면 ✎ 표시가 붙어요.
      </p>
    </>
  );
}
