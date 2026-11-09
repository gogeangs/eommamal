import { useState } from 'react';
import { LANGS } from '../content';
import { TopBar } from '../components/ui';
import { useProgress } from '../lib/progress';

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
      setError('문의 내용을 적어 주세요.');
      return;
    }
    setError('');
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    setStatus('메일 앱이 열리면 보내기를 눌러 주세요. 메일 앱이 열리지 않으면 아래 "내용 복사"를 눌러 메일이나 메시지에 붙여 넣어 주세요.');
  };

  return (
    <>
      <TopBar />
      <header>
        <h1>문의하기</h1>
        <p className="lead">기관 도입, 번역·녹음 참여, 오류 신고 모두 환영해요. 모국어로 적어도 괜찮아요.</p>
      </header>

      <form className="contact" onSubmit={send} noValidate>
        <fieldset>
          <legend className="label">문의 종류</legend>
          <div className="topic-list">
            {TOPICS.map((x) => (
              <label key={x.id} className={`topic${topic === x.id ? ' on' : ''}`} htmlFor={`topic-${x.id}`}>
                <input type="radio" name="topic" id={`topic-${x.id}`} value={x.id} checked={topic === x.id} onChange={() => setTopic(x.id)} />
                <b>{x.label}</b>
                <span>{x.hint}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="field" htmlFor="c-name">
          <span className="label">이름 또는 기관 이름 (선택)</span>
          <input id="c-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="예: 원곡동 작은도서관" />
        </label>

        <label className="field" htmlFor="c-reply">
          <span className="label">답장 받을 연락처 (선택)</span>
          <input id="c-reply" value={reply} onChange={(e) => setReply(e.target.value)} autoComplete="email" placeholder="이메일 또는 전화번호" />
        </label>

        <label className="field" htmlFor="c-body">
          <span className="label">문의 내용</span>
          <textarea
            id="c-body"
            rows={6}
            value={body}
            onChange={(e) => { setBody(e.target.value); if (error) setError(''); }}
            placeholder={topic === 'bug' ? '어느 동화의 몇 쪽에서 어떤 문제가 있었는지 적어 주세요.' : '자유롭게 적어 주세요.'}
            aria-invalid={!!error}
            aria-describedby={error ? 'c-error' : undefined}
          />
        </label>
        {error && <p className="form-error" id="c-error" role="alert">{error}</p>}

        <button className="play" type="submit">메일로 보내기</button>
        <button
          className="btn2"
          type="button"
          onClick={async () => {
            if (!body.trim()) {
              setError('문의 내용을 적어 주세요.');
              return;
            }
            setError('');
            setStatus((await copy(`받는 곳: ${CONTACT_EMAIL}\n제목: ${subject}\n\n${message}`)) ? '내용을 복사했어요. 메일이나 메시지에 붙여 넣어 보내 주세요.' : '복사가 안 되는 화면이에요. 위 내용을 길게 눌러 직접 복사해 주세요.');
          }}
        >
          내용 복사
        </button>
        <p className="voice" role="status">{status}</p>
      </form>

      <section className="contact-card">
        <p className="label" style={{ margin: 0 }}>받는 곳</p>
        <div className="row" style={{ alignItems: 'center' }}>
          <b className="mail" style={{ userSelect: 'all' }}>{CONTACT_EMAIL}</b>
          <button
            className="ghost"
            type="button"
            onClick={async () => setStatus((await copy(CONTACT_EMAIL)) ? '메일 주소를 복사했어요.' : '주소를 길게 눌러 복사해 주세요.')}
          >
            주소 복사
          </button>
        </div>
        <p className="k">주식회사 프로젝트서티즈 · 보내 주신 내용은 답변과 서비스 개선에만 사용해요.</p>
      </section>
    </>
  );
}
