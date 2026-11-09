import { useState } from 'react';
import { ALL_WORDS, STORIES, V, type LangId } from '../content';
import { Scene, TopBar, WordCard } from '../components/ui';
import { AVATARS, childName, useProgress, type Profile } from '../lib/progress';
import { KO, pt } from '../lib/parentUi';
import { WORD_ART } from '../content';

const avatarSrc = (id: string) => `${import.meta.env.BASE_URL}images/words/${WORD_ART[id] ? id : 'cat'}.webp`;

export function Avatar({ pr, size = 40 }: { pr: Profile; size?: number }) {
  return (
    <span className="avatar" style={{ width: size, height: size, background: WORD_ART[pr.avatar] ?? '#FCE8D4' }}>
      <img src={avatarSrc(pr.avatar)} alt="" />
    </span>
  );
}

/** Heading in the family's language with the Korean underneath. */
function H({ lang, k, n }: { lang: LangId; k: keyof typeof KO; n?: string }) {
  return (
    <h2 className="ph">
      <span lang={lang}>{pt(lang, k)}{n && <em> {n}</em>}</span>
      <small>{KO[k]}</small>
    </h2>
  );
}

const DAY = ['일', '월', '화', '수', '목', '금', '토'];
function lastWeek() {
  const out: { key: string; label: string; today: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    out.push({ key, label: DAY[d.getDay()], today: i === 0 });
  }
  return out;
}

function ChildManager() {
  const { profiles, profile, addProfile, updateProfile, removeProfile, resetProfile } = useProgress();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState(AVATARS[1]);
  const [confirm, setConfirm] = useState<'' | 'reset' | 'remove'>('');
  const idx = profiles.findIndex((x) => x.id === profile.id);
  const name = childName(profile, idx);

  return (
    <section className="pcard stack">
      <div className="field">
        <label htmlFor="child-name">이름 또는 별명</label>
        <input id="child-name" value={profile.name} placeholder={`아이 ${idx + 1}`} maxLength={12}
          onChange={(e) => updateProfile(profile.id, { name: e.target.value })} />
        <small>실명 대신 별명을 써도 돼요.</small>
      </div>
      <div className="field">
        <span className="flabel">그림</span>
        <div className="avatar-pick" role="group" aria-label="그림 고르기">
          {AVATARS.map((a) => (
            <button key={a} aria-pressed={profile.avatar === a} onClick={() => updateProfile(profile.id, { avatar: a })} aria-label={V[a]?.ko ?? a}>
              <Avatar pr={{ ...profile, avatar: a }} size={44} />
            </button>
          ))}
        </div>
      </div>

      {adding ? (
        <form className="stack add-child" onSubmit={(e) => { e.preventDefault(); addProfile(newName.trim(), newAvatar); setAdding(false); setNewName(''); }}>
          <p className="label" style={{ margin: 0 }}>새 아이 추가</p>
          <div className="field">
            <label htmlFor="new-child">이름 또는 별명</label>
            <input id="new-child" value={newName} placeholder={`아이 ${profiles.length + 1}`} maxLength={12} onChange={(e) => setNewName(e.target.value)} />
          </div>
          <div className="avatar-pick" role="group" aria-label="새 아이 그림">
            {AVATARS.map((a) => (
              <button type="button" key={a} aria-pressed={newAvatar === a} onClick={() => setNewAvatar(a)} aria-label={V[a]?.ko ?? a}>
                <Avatar pr={{ id: 'new', name: '', avatar: a }} size={44} />
              </button>
            ))}
          </div>
          <p className="pnote">우리 집 말과 읽기 설정은 지금 아이와 같게 시작해요. 기록은 따로 쌓여요.</p>
          <div className="prow">
            <button type="button" className="btn2" onClick={() => setAdding(false)}>취소</button>
            <button type="submit" className="play">추가하기</button>
          </div>
        </form>
      ) : (
        <button className="btn2" onClick={() => setAdding(true)}>+ 아이 추가 (형제·자매)</button>
      )}

      {confirm ? (
        <div className="confirm" role="alertdialog" aria-labelledby="cf-t">
          <p id="cf-t">
            {confirm === 'reset'
              ? `${name}의 읽은 책, 낱말, 받아쓰기 기록을 모두 지울까요? 되돌릴 수 없어요.`
              : `${name}을(를) 이 기기에서 지울까요? 기록도 함께 지워지고 되돌릴 수 없어요.`}
          </p>
          <div className="prow">
            <button className="btn2" onClick={() => setConfirm('')}>취소</button>
            <button className="play danger" onClick={() => {
              if (confirm === 'reset') resetProfile(profile.id); else removeProfile(profile.id);
              setConfirm('');
            }}>{confirm === 'reset' ? '기록 지우기' : '아이 지우기'}</button>
          </div>
        </div>
      ) : (
        <div className="prow">
          <button className="ghost danger" onClick={() => setConfirm('reset')}>{name}의 기록 지우기</button>
          {profiles.length > 1 && <button className="ghost danger" onClick={() => setConfirm('remove')}>{name} 지우기</button>}
        </div>
      )}
    </section>
  );
}

export function Parent() {
  const { p, profiles, profile, switchProfile } = useProgress();
  const lang = p.lang;
  const shelf = STORIES.filter((s) => !s.hidden);
  const finished = shelf.filter((s) => p.finished.includes(s.id)).length;
  const days = new Set(p.days);
  const week = lastWeek();
  const active = week.filter((d) => days.has(d.key)).length;
  const hard = Object.entries(p.misses).filter(([id, n]) => n > 0 && V[id]).sort((a, b) => b[1] - a[1]).slice(0, 9);
  const learned = ALL_WORDS.filter((id) => p.learned.includes(id));

  return (
    <>
      <TopBar />
      <header className="phead">
        <h1>{KO.title}</h1>
        <p className="lead" lang={lang}>{pt(lang, 'title')}</p>
      </header>

      <div className="child-tabs" role="tablist" aria-label="아이 고르기">
        {profiles.map((pr, i) => (
          <button key={pr.id} role="tab" aria-selected={pr.id === profile.id} onClick={() => switchProfile(pr.id)}>
            <Avatar pr={pr} size={36} />
            <span>{childName(pr, i)}</span>
          </button>
        ))}
      </div>

      <section className="pcard">
        <H lang={lang} k="week" n={`${active} / 7`} />
        <ol className="week" aria-label={`최근 7일 중 ${active}일 공부했어요`}>
          {week.map((d) => (
            <li key={d.key} className={`${days.has(d.key) ? 'on' : ''}${d.today ? ' today' : ''}`}>
              <i aria-hidden="true">{days.has(d.key) ? '★' : ''}</i>
              <span>{d.today ? '오늘' : d.label}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="summary four" aria-label="학습 요약">
        <div><b>{finished}<small>/{shelf.length}</small></b><span lang={lang}>{pt(lang, 'books')}</span><span>{KO.books}</span></div>
        <div><b>{p.learned.length}<small>/{ALL_WORDS.length}</small></b><span lang={lang}>{pt(lang, 'words')}</span><span>{KO.words}</span></div>
        <div><b>{p.written.length}</b><span lang={lang}>{pt(lang, 'written')}</span><span>{KO.written}</span></div>
        <div><b>{p.sentences.length}</b><span lang={lang}>{pt(lang, 'sentences')}</span><span>{KO.sentences}</span></div>
      </section>

      <section className="pcard">
        <H lang={lang} k="hard" />
        {hard.length ? (
          <>
            <p className="ptip" lang={lang}>{pt(lang, 'hardTip')}</p>
            <p className="pnote">{KO.hardTip}</p>
            <div className="wbook">
              {hard.map(([id, n]) => (
                <div key={id} className="hard-word">
                  <WordCard id={id} />
                  <span className="miss-n" aria-label={`${n}번 틀렸어요`}>✕{n}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="pnote"><span lang={lang}>{pt(lang, 'noHard')}</span> · {KO.noHard}</p>
        )}
      </section>

      <section className="pcard">
        <H lang={lang} k="books" n={`${finished} / ${shelf.length}`} />
        <ul className="pbooks">
          {shelf.map((s) => {
            const done = p.finished.includes(s.id);
            const at = p.pages[s.id] ?? 0;
            const state = done ? 'done' : at > 0 ? 'reading' : 'notYet';
            return (
              <li key={s.id}>
                <Scene page={s.pages[0]} className="pthumb" />
                <div>
                  <b>{s.title.ko}</b>
                  <span lang={lang}>{s.title[lang]}</span>
                  <span className="pmeta">
                    <em className={`pst ${state}`}>{pt(lang, state)} · {KO[state]}{state === 'reading' ? ` (${at + 1}/${s.pages.length}쪽)` : ''}</em>
                    {p.quizStars[s.id] ? <em>낱말 놀이 ★{p.quizStars[s.id]}</em> : null}
                    {p.dictStars[s.id] ? <em>받아쓰기 ★{p.dictStars[s.id]}</em> : null}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {learned.length > 0 && (
        <details className="pcard">
          <summary><span lang={lang}>{pt(lang, 'learnedList')}</span> · {KO.learnedList} ({learned.length})</summary>
          <ul className="learned-list">
            {learned.map((id) => (
              <li key={id}><b>{V[id].ko}</b><span lang={lang}>{V[id][lang]}</span>{p.written.includes(id) && <em>✎</em>}</li>
            ))}
          </ul>
        </details>
      )}

      <H lang={lang} k="children" />
      <ChildManager />

      <p className="pnote privacy"><span lang={lang}>{pt(lang, 'privacy')}</span><br />{KO.privacy}</p>
    </>
  );
}
