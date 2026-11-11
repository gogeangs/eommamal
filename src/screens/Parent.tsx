import { useState } from 'react';
import { ALL_WORDS, STORIES, V, type LangId } from '../content';
import { Scene, TopBar, WordCard } from '../components/ui';
import { AVATARS, childName, useProgress, type Profile } from '../lib/progress';
import { pt } from '../lib/parentUi';
import { g, LOCALE } from '../lib/grownUi';
import { t } from '../lib/childUi';
import { WORD_ART } from '../content';
import { GatedSubscribe, PlanStatus } from './Subscribe';
import { AccountPanel } from './AccountPanel';
import { useAccount } from '../lib/account';

const avatarSrc = (id: string) => `${import.meta.env.BASE_URL}images/words/${WORD_ART[id] ? id : 'cat'}.webp`;

export function Avatar({ pr, size = 40 }: { pr: Profile; size?: number }) {
  return (
    <span className="avatar" style={{ width: size, height: size, background: WORD_ART[pr.avatar] ?? '#FCE8D4' }}>
      <img src={avatarSrc(pr.avatar)} alt="" />
    </span>
  );
}

/** Heading in the family's language (grown-up screens are never in Korean). */
function H({ lang, k, n }: { lang: LangId; k: Parameters<typeof pt>[1]; n?: string }) {
  return (
    <h2 className="ph">
      <span lang={lang}>{pt(lang, k)}{n && <em> {n}</em>}</span>
    </h2>
  );
}

function lastWeek(lang: LangId) {
  const day = new Intl.DateTimeFormat(LOCALE[lang], { weekday: 'short' });
  const out: { key: string; label: string; today: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    out.push({ key, label: day.format(d), today: i === 0 });
  }
  return out;
}

function ChildManager() {
  const { p, profiles, profile, addProfile, updateProfile, removeProfile, resetProfile } = useProgress();
  const L = p.lang;
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState(AVATARS[1]);
  const [confirm, setConfirm] = useState<'' | 'reset' | 'remove'>('');
  const idx = profiles.findIndex((x) => x.id === profile.id);
  const name = childName(profile, idx, p.lang);

  return (
    <section className="pcard stack" lang={L}>
      <div className="field">
        <label htmlFor="child-name">{g(L, 'nameLabel')}</label>
        <input id="child-name" value={profile.name} placeholder={g(L, 'childN', { n: idx + 1 })} maxLength={12}
          onChange={(e) => updateProfile(profile.id, { name: e.target.value })} />
        <small>{g(L, 'nickTip')}</small>
      </div>
      <div className="field">
        <span className="flabel">{g(L, 'picture')}</span>
        <div className="avatar-pick" role="group" aria-label={g(L, 'picture')}>
          {AVATARS.map((a) => (
            <button key={a} aria-pressed={profile.avatar === a} onClick={() => updateProfile(profile.id, { avatar: a })} aria-label={V[a]?.ko ?? a}>
              <Avatar pr={{ ...profile, avatar: a }} size={44} />
            </button>
          ))}
        </div>
      </div>

      {adding ? (
        <form className="stack add-child" onSubmit={(e) => { e.preventDefault(); addProfile(newName.trim(), newAvatar); setAdding(false); setNewName(''); }}>
          <p className="label" style={{ margin: 0 }}>{g(L, 'addChild')}</p>
          <div className="field">
            <label htmlFor="new-child">{g(L, 'nameLabel')}</label>
            <input id="new-child" value={newName} placeholder={g(L, 'childN', { n: profiles.length + 1 })} maxLength={12} onChange={(e) => setNewName(e.target.value)} />
          </div>
          <div className="avatar-pick" role="group" aria-label={g(L, 'picture')}>
            {AVATARS.map((a) => (
              <button type="button" key={a} aria-pressed={newAvatar === a} onClick={() => setNewAvatar(a)} aria-label={V[a]?.ko ?? a}>
                <Avatar pr={{ id: 'new', name: '', avatar: a }} size={44} />
              </button>
            ))}
          </div>
          <p className="pnote">{g(L, 'startsSame')}</p>
          <div className="prow">
            <button type="button" className="btn2" onClick={() => setAdding(false)}>{g(L, 'cancel')}</button>
            <button type="submit" className="play">{g(L, 'add')}</button>
          </div>
        </form>
      ) : (
        <button className="btn2" onClick={() => setAdding(true)}>{g(L, 'addSibling')}</button>
      )}

      {confirm ? (
        <div className="confirm" role="alertdialog" aria-labelledby="cf-t">
          <p id="cf-t">
            {g(L, confirm === 'reset' ? 'confirmReset' : 'confirmRemove', { name })}
          </p>
          <div className="prow">
            <button className="btn2" onClick={() => setConfirm('')}>{g(L, 'cancel')}</button>
            <button className="play danger" onClick={() => {
              if (confirm === 'reset') resetProfile(profile.id); else removeProfile(profile.id);
              setConfirm('');
            }}>{g(L, confirm === 'reset' ? 'resetBtn' : 'removeBtn')}</button>
          </div>
        </div>
      ) : (
        <div className="prow">
          <button className="ghost danger" onClick={() => setConfirm('reset')}>{g(L, 'resetOf', { name })}</button>
          {profiles.length > 1 && <button className="ghost danger" onClick={() => setConfirm('remove')}>{g(L, 'removeOf', { name })}</button>}
        </div>
      )}
    </section>
  );
}

export function Parent() {
  const { p, profiles, profile, switchProfile } = useProgress();
  const signedIn = !!useAccount().email;
  const lang = p.lang;
  const shelf = STORIES.filter((s) => !s.hidden);
  const finished = shelf.filter((s) => p.finished.includes(s.id)).length;
  const days = new Set(p.days);
  const week = lastWeek(lang);
  const active = week.filter((d) => days.has(d.key)).length;
  const hard = Object.entries(p.misses).filter(([id, n]) => n > 0 && V[id]).sort((a, b) => b[1] - a[1]).slice(0, 9);
  const learned = ALL_WORDS.filter((id) => p.learned.includes(id));

  return (
    <>
      <TopBar grown />
      <header className="phead">
        <h1 lang={lang}>{pt(lang, 'title')}</h1>
      </header>

      <div className="child-tabs" role="tablist" aria-label={g(lang, 'chooseChild')}>
        {profiles.map((pr, i) => (
          <button key={pr.id} role="tab" aria-selected={pr.id === profile.id} onClick={() => switchProfile(pr.id)}>
            <Avatar pr={pr} size={36} />
            <span>{childName(pr, i, p.lang)}</span>
          </button>
        ))}
      </div>

      <div id="subscribe">
        <PlanStatus />
        <GatedSubscribe />
      </div>

      <section className="pcard">
        <H lang={lang} k="week" n={`${active} / 7`} />
        <ol className="week" lang={lang} aria-label={g(lang, 'daysStudied', { n: active })}>
          {week.map((d) => (
            <li key={d.key} className={`${days.has(d.key) ? 'on' : ''}${d.today ? ' today' : ''}`}>
              <i aria-hidden="true">{days.has(d.key) ? '★' : ''}</i>
              <span>{d.today ? g(lang, 'today') : d.label}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="summary four" lang={lang} aria-label={g(lang, 'summary')}>
        <div><b>{finished}<small>/{shelf.length}</small></b><span>{pt(lang, 'books')}</span></div>
        <div><b>{p.learned.length}<small>/{ALL_WORDS.length}</small></b><span>{pt(lang, 'words')}</span></div>
        <div><b>{p.written.length}</b><span>{pt(lang, 'written')}</span></div>
        <div><b>{p.sentences.length}</b><span>{pt(lang, 'sentences')}</span></div>
      </section>

      <section className="pcard">
        <H lang={lang} k="hard" />
        {hard.length ? (
          <>
            <p className="ptip" lang={lang}>{pt(lang, 'hardTip')}</p>
            <div className="wbook">
              {hard.map(([id, n]) => (
                <div key={id} className="hard-word">
                  <WordCard id={id} />
                  <span className="miss-n" aria-label={g(lang, 'missed', { n })}>✕{n}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="pnote" lang={lang}>{pt(lang, 'noHard')}</p>
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
                  <b lang={lang}>{s.title[lang]}</b>
                  <span lang="ko">{s.title.ko}</span>
                  <span className="pmeta" lang={lang}>
                    <em className={`pst ${state}`}>{pt(lang, state)}{state === 'reading' ? ` · ${g(lang, 'pages', { a: at + 1, b: s.pages.length })}` : ''}</em>
                    {p.quizStars[s.id] ? <em>{t(lang, 'play')} ★{p.quizStars[s.id]}</em> : null}
                    {p.dictStars[s.id] ? <em>{t(lang, 'dictation')} ★{p.dictStars[s.id]}</em> : null}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {learned.length > 0 && (
        <details className="pcard">
          <summary lang={lang}>{pt(lang, 'learnedList')} ({learned.length})</summary>
          <ul className="learned-list">
            {learned.map((id) => (
              <li key={id}><b>{V[id].ko}</b><span lang={lang}>{V[id][lang]}</span>{p.written.includes(id) && <em>✎</em>}</li>
            ))}
          </ul>
        </details>
      )}

      <AccountPanel />

      <H lang={lang} k="children" />
      <ChildManager />

      <p className="pnote privacy" lang={lang}>{pt(lang, signedIn ? 'privacySync' : 'privacy')}</p>
    </>
  );
}
