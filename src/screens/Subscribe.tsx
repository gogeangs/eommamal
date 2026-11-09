import { useMemo, useState } from 'react';
import type { LangId } from '../content';
import { Illus } from '../components/ui';
import { useProgress } from '../lib/progress';
import { DAILY_STORIES, usePlan } from '../lib/plan';
import { useNav } from '../nav';

/** Subscription wording in the family's language (Korean shown alongside). Drafts for native review. */
type Key = 'done' | 'tomorrow' | 'ask' | 'plan' | 'b1' | 'b2' | 'b3' | 'renew' | 'appOnly' | 'active' | 'trialLeft' | 'todayLeft' | 'month';
const KO: Record<Key, string> = {
  done: `오늘 읽을 동화 ${DAILY_STORIES}권을 다 읽었어요`,
  tomorrow: '내일 또 새 동화를 읽어요. 오늘 읽은 동화는 다시 볼 수 있고, 낱말 놀이도 계속할 수 있어요.',
  ask: '가족 구독을 하면 동화를 마음껏 읽을 수 있어요. 엄마 아빠에게 물어봐요!',
  plan: '가족 구독',
  b1: '모든 동화를 매일 마음껏',
  b2: '새 동화가 나오면 바로',
  b3: '형제·자매 모두 함께',
  renew: '매월 자동으로 갱신돼요. 언제든 App Store·Google Play 구독 관리에서 해지할 수 있어요.',
  appOnly: '구독은 앱(App Store·Google Play)에서 할 수 있어요.',
  active: '가족 구독 중이에요',
  trialLeft: '무료 체험 {n}일 남았어요',
  todayLeft: '오늘 읽을 수 있는 동화 {n}권',
  month: '월',
};
const MO: Record<LangId, Record<Key, string>> = {
  ru: { done: `Сегодняшние ${DAILY_STORIES} книги прочитаны`, tomorrow: 'Завтра можно читать снова. Прочитанные сегодня книги и игры со словами открыты.', ask: 'С семейной подпиской можно читать без ограничений — спроси маму и папу!', plan: 'Семейная подписка', b1: 'Все книги каждый день без ограничений', b2: 'Новые книги сразу после выхода', b3: 'Для всех детей в семье', renew: 'Подписка продлевается каждый месяц. Отменить можно в любой момент в App Store или Google Play.', appOnly: 'Оформить подписку можно в приложении (App Store, Google Play).', active: 'Подписка активна', trialLeft: 'Бесплатный период: осталось {n} дн.', todayLeft: 'Сегодня можно открыть ещё {n}', month: 'в месяц' },
  mn: { done: `Өнөөдрийн ${DAILY_STORIES} номоо уншиж дууслаа`, tomorrow: 'Маргааш дахин уншина. Өнөөдөр уншсан ном, үгийн тоглоом нээлттэй.', ask: 'Гэр бүлийн захиалгаар хязгааргүй уншина — ээж ааваасаа асуугаарай!', plan: 'Гэр бүлийн захиалга', b1: 'Бүх номыг өдөр бүр хязгааргүй', b2: 'Шинэ ном гармагц', b3: 'Гэр бүлийн бүх хүүхдэд', renew: 'Захиалга сар бүр сунгагдана. App Store, Google Play-ээс хүссэн үедээ цуцална.', appOnly: 'Захиалгыг аппликейшнээс (App Store, Google Play) хийнэ.', active: 'Захиалга идэвхтэй', trialLeft: 'Үнэгүй хугацаа {n} өдөр үлдлээ', todayLeft: 'Өнөөдөр {n} ном унших боломжтой', month: 'сард' },
  vi: { done: `Hôm nay con đã đọc hết ${DAILY_STORIES} truyện rồi`, tomorrow: 'Ngày mai đọc tiếp nhé. Truyện đã đọc hôm nay và trò chơi từ vựng vẫn dùng được.', ask: 'Đăng ký gói gia đình để đọc không giới hạn — hãy hỏi bố mẹ nhé!', plan: 'Gói gia đình', b1: 'Đọc mọi truyện mỗi ngày, không giới hạn', b2: 'Có truyện mới ngay khi ra mắt', b3: 'Cho tất cả các con trong nhà', renew: 'Gói tự động gia hạn hằng tháng. Có thể hủy bất cứ lúc nào trong App Store hoặc Google Play.', appOnly: 'Có thể đăng ký trong ứng dụng (App Store, Google Play).', active: 'Đang dùng gói gia đình', trialLeft: 'Còn {n} ngày dùng thử miễn phí', todayLeft: 'Hôm nay còn đọc được {n} truyện', month: '/ tháng' },
  uz: { done: `Bugungi ${DAILY_STORIES} ta ertak o'qib bo'lindi`, tomorrow: "Ertaga yana o'qiymiz. Bugun o'qilgan ertaklar va so'z o'yinlari ochiq.", ask: "Oilaviy obuna bilan cheklovsiz o'qish mumkin — ota-onangdan so'ra!", plan: 'Oilaviy obuna', b1: 'Barcha ertaklar har kuni cheklovsiz', b2: 'Yangi ertaklar chiqishi bilan', b3: 'Oiladagi barcha farzandlar uchun', renew: "Obuna har oy yangilanadi. App Store yoki Google Play'da istalgan vaqtda bekor qilish mumkin.", appOnly: 'Obunani ilovada (App Store, Google Play) rasmiylashtirish mumkin.', active: 'Obuna faol', trialLeft: 'Bepul sinov: {n} kun qoldi', todayLeft: "Bugun yana {n} ta ertak o'qish mumkin", month: 'oyiga' },
  zh: { done: `今天的${DAILY_STORIES}本故事已经读完了`, tomorrow: '明天再读新故事吧。今天读过的故事和词语游戏还可以继续。', ask: '订阅家庭套餐就能无限阅读——问问爸爸妈妈吧！', plan: '家庭订阅', b1: '所有故事每天随意读', b2: '新故事一上线就能读', b3: '家里的孩子都能用', renew: '每月自动续费，可随时在 App Store 或 Google Play 中取消。', appOnly: '请在App（App Store、Google Play）中订阅。', active: '已订阅家庭套餐', trialLeft: '免费试用还剩{n}天', todayLeft: '今天还能读{n}本', month: '每月' },
  en: { done: `You've read today's ${DAILY_STORIES} stories`, tomorrow: 'Read more tomorrow! Stories you read today and word games are still open.', ask: 'With a family subscription you can read as much as you like — ask your mom and dad!', plan: 'Family subscription', b1: 'Every story, every day, no limit', b2: 'New stories as soon as they come out', b3: 'For all the children in your family', renew: 'Renews monthly. Cancel anytime in App Store or Google Play.', appOnly: 'You can subscribe in the app (App Store, Google Play).', active: 'Family subscription active', trialLeft: '{n} days of free trial left', todayLeft: '{n} more stories today', month: '/ month' },
};
const fill = (s: string, n: number) => s.replace('{n}', String(n));
export const planText = (lang: LangId, k: Key, n = 0) => ({ mo: fill(MO[lang][k], n), ko: fill(KO[k], n) });

/** A small grown-up check before anything about payment: pick the answer to a multiplication. */
function ParentGate({ onPass, onCancel }: { onPass: () => void; onCancel: () => void }) {
  const q = useMemo(() => {
    const a = 3 + Math.floor(Math.random() * 6), b = 3 + Math.floor(Math.random() * 6), ans = a * b;
    const opts = [ans, ans + a, ans - b].sort(() => Math.random() - 0.5);
    return { a, b, ans, opts };
  }, []);
  const [wrong, setWrong] = useState(false);
  return (
    <div className="gate stack" role="group" aria-labelledby="gate-q">
      <p className="label" style={{ margin: 0 }}>보호자 확인</p>
      <p id="gate-q" className="gate-q">{q.a} × {q.b} = ?</p>
      <div className="gate-opts">
        {q.opts.map((o) => (
          <button key={o} className="btn2" onClick={() => (o === q.ans ? onPass() : setWrong(true))}>{o}</button>
        ))}
      </div>
      {wrong && <p className="pnote">다시 골라 주세요.</p>}
      <button className="ghost" onClick={onCancel}>취소</button>
    </div>
  );
}

/** Family-subscription offer for grown-ups. */
export function SubscribePanel() {
  const { p } = useProgress();
  const plan = usePlan();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const L = (k: Key, n = 0) => planText(p.lang, k, n);

  if (plan.state === 'sub') {
    const a = L('active');
    return (
      <section className="pcard sub-card on">
        <h2 className="ph"><span lang={p.lang}>{a.mo}</span><small>{a.ko}</small></h2>
        {plan.sub.until && <p className="pnote">다음 갱신일: {new Date(plan.sub.until).toLocaleDateString('ko-KR')}</p>}
      </section>
    );
  }

  const run = async (fn: () => Promise<void>) => {
    setBusy(true); setMsg('');
    try { await fn(); } catch (e) { setMsg(e instanceof Error ? e.message : '잠시 후 다시 시도해 주세요.'); }
    setBusy(false);
  };

  return (
    <section className="pcard sub-card stack">
      <h2 className="ph"><span lang={p.lang}>{L('plan').mo}</span><small>{L('plan').ko}</small></h2>
      <p className="sub-price"><b>{plan.price}</b> <span lang={p.lang}>{L('month').mo}</span> · 월</p>
      <ul className="sub-list">
        {(['b1', 'b2', 'b3'] as const).map((k) => (
          <li key={k}><span lang={p.lang}>{L(k).mo}</span><small>{L(k).ko}</small></li>
        ))}
      </ul>
      {plan.native ? (
        <>
          <button className="play" disabled={busy} onClick={() => run(plan.subscribe)}>{busy ? '잠시만요…' : `${plan.price} / 월 구독하기`}</button>
          <button className="ghost" disabled={busy} onClick={() => run(plan.restore)}>구독 복원하기</button>
        </>
      ) : (
        <p className="sub-app"><span lang={p.lang}>{L('appOnly').mo}</span><br />{L('appOnly').ko}</p>
      )}
      {msg && <p className="pnote" role="alert">{msg}</p>}
      <p className="pnote"><span lang={p.lang}>{L('renew').mo}</span><br />{L('renew').ko}</p>
    </section>
  );
}

/** Shown instead of a story once today's free stories are used up. */
export function ReadLimit() {
  const { p } = useProgress();
  const nav = useNav();
  const [step, setStep] = useState<'kid' | 'gate' | 'offer'>('kid');
  const L = (k: Key) => planText(p.lang, k);
  return (
    <section className="read-limit stack">
      <Illus name="celebrate" className="illus limit-art" />
      <h1 lang={p.lang}>{L('done').mo}</h1>
      <p className="lead">{L('done').ko}</p>
      <p lang={p.lang} className="limit-mo">{L('tomorrow').mo}</p>
      <p className="pnote">{L('tomorrow').ko}</p>
      <div className="prow">
        <button className="btn2" onClick={() => nav({ view: 'home' }, { replace: true })}>책장으로</button>
        <button className="play" onClick={() => nav({ view: 'quiz', story: 'all' }, { replace: true })}>낱말 놀이</button>
      </div>
      <div className="limit-parent">
        <p lang={p.lang}>{L('ask').mo}</p>
        <p className="pnote">{L('ask').ko}</p>
        {step === 'kid' && <button className="ghost" onClick={() => setStep('gate')}>보호자: 가족 구독 알아보기 ›</button>}
        {step === 'gate' && <ParentGate onPass={() => setStep('offer')} onCancel={() => setStep('kid')} />}
      </div>
      {step === 'offer' && <SubscribePanel />}
    </section>
  );
}

/** One-line plan status for grown-ups (home and parent screen). */
export function PlanStatus() {
  const { p } = useProgress();
  const plan = usePlan();
  if (plan.state === 'sub') return null;
  const t = plan.state === 'trial' ? planText(p.lang, 'trialLeft', plan.trialLeft) : planText(p.lang, 'todayLeft', plan.todayLeft);
  return (
    <p className={`plan-status ${plan.state}`}>
      <span lang={p.lang}>{t.mo}</span>
      <small>{t.ko}</small>
    </p>
  );
}

/** Subscription offer behind the grown-up check (parent screen). */
export function GatedSubscribe() {
  const plan = usePlan();
  const [open, setOpen] = useState(false);
  if (plan.state === 'sub' || open) return <SubscribePanel />;
  return <GateThen onPass={() => setOpen(true)} />;
}
function GateThen({ onPass }: { onPass: () => void }) {
  const [gate, setGate] = useState(false);
  return gate
    ? <section className="pcard"><ParentGate onPass={onPass} onCancel={() => setGate(false)} /></section>
    : <button className="parent-link" onClick={() => setGate(true)}><span>가족 구독 알아보기 · 월 4,900원</span><span aria-hidden="true">›</span></button>;
}
