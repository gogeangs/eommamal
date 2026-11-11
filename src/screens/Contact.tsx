import { useState } from 'react';
import { LANGS } from '../content';
import { TopBar } from '../components/ui';
import { useProgress } from '../lib/progress';
import { ct } from '../lib/contactUi';

/** Where inquiries go. Shown publicly on the page. */
export const CONTACT_EMAIL = 'biz@project30s.co.kr';

const TOPICS = [
  { id: 'org', label: '기관 도입·제휴', hint: '도서관, 학교, 지역아동센터, 이주민 단체' },
  { id: 'help', label: '번역·녹음 참여', hint: '모국어 번역 검수, 동화 녹음 자원봉사' },
  { id: 'bug', label: '오류 신고', hint: '틀린 번역, 소리가 안 나요, 화면 오류' },
  { id: 'etc', label: '기타 문의', hint: '그 밖의 의견이나 질문' },
] as const;

type TopicId = (typeof TOPICS)[number]['id'];

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function Contact() {
  const { p } = useProgress();
  const L = p.lang;
  const [topic, setTopic] = useState<TopicId>('org');
  const [name, setName] = useState('');
  const [reply, setReply] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const t = TOPICS.find((x) => x.id === topic)!;
  const lang = LANGS.find((l) => l.id === p.lang)!;
  const subject = `[엄마말 그림책] ${t.label}${name.trim() ? ` - ${name.trim()}` : ''}`;
  const message = [
    `문의 종류: ${t.label}`,
    `이름·기관: ${name.trim() || '(적지 않음)'}`,
    `답장 받을 연락처: ${reply.trim() || '(적지 않음)'}`,
    '',
    body.trim(),
    '',
    '---',
    `우리 집 말: ${lang.ko} (${lang.name})`,
    `기기: ${navigator.userAgent}`,
  ].join('\n');

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) {
      setError(ct(L, 'needBody'));
      return;
    }
    setError('');
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    setStatus(ct(L, 'opened'));
  };

  return (
    <>
      <TopBar grown />
      <header lang={L}>
        <h1>{ct(L, 'title')}</h1>
        <p className="lead">{ct(L, 'lead')}</p>
      </header>

      <form className="contact" onSubmit={send} noValidate lang={L}>
        <fieldset>
          <legend className="label">{ct(L, 'kind')}</legend>
          <div className="topic-list">
            {TOPICS.map((x) => (
              <label key={x.id} className={`topic${topic === x.id ? ' on' : ''}`} htmlFor={`topic-${x.id}`}>
                <input type="radio" name="topic" id={`topic-${x.id}`} value={x.id} checked={topic === x.id} onChange={() => setTopic(x.id)} />
                <b>{ct(L, x.id)}</b>
                <span>{ct(L, `${x.id}Hint`)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="field" htmlFor="c-name">
          <span className="label">{ct(L, 'name')}</span>
          <input id="c-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder={ct(L, 'namePh')} />
        </label>

        <label className="field" htmlFor="c-reply">
          <span className="label">{ct(L, 'reply')}</span>
          <input id="c-reply" value={reply} onChange={(e) => setReply(e.target.value)} autoComplete="email" placeholder={ct(L, 'replyPh')} />
        </label>

        <label className="field" htmlFor="c-body">
          <span className="label">{ct(L, 'body')}</span>
          <textarea
            id="c-body"
            rows={6}
            value={body}
            onChange={(e) => { setBody(e.target.value); if (error) setError(''); }}
            placeholder={ct(L, topic === 'bug' ? 'bodyPhBug' : 'bodyPh')}
            aria-invalid={!!error}
            aria-describedby={error ? 'c-error' : undefined}
          />
        </label>
        {error && <p className="form-error" id="c-error" role="alert">{error}</p>}

        <button className="play" type="submit">{ct(L, 'send')}</button>
        <button
          className="btn2"
          type="button"
          onClick={async () => {
            if (!body.trim()) {
              setError(ct(L, 'needBody'));
              return;
            }
            setError('');
            setStatus((await copy(`받는 곳: ${CONTACT_EMAIL}\n제목: ${subject}\n\n${message}`)) ? ct(L, 'copied') : ct(L, 'copyFail'));
          }}
        >
          {ct(L, 'copy')}
        </button>
        <p className="voice" role="status">{status}</p>
      </form>

      <section className="contact-card" lang={L}>
        <p className="label" style={{ margin: 0 }}>{ct(L, 'to')}</p>
        <div className="row" style={{ alignItems: 'center' }}>
          <b className="mail" style={{ userSelect: 'all' }}>{CONTACT_EMAIL}</b>
          <button
            className="ghost"
            type="button"
            onClick={async () => setStatus((await copy(CONTACT_EMAIL)) ? ct(L, 'addrCopied') : ct(L, 'addrFail'))}
          >
            {ct(L, 'copyAddr')}
          </button>
        </div>
        <p className="k">{ct(L, 'note')}</p>
      </section>
    </>
  );
}
