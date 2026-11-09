import { useEffect, useMemo, useRef, useState } from 'react';
import { UI, V, findStory, syllables } from '../content';
import { Illus, Progress, Tile, TopBar, WordCard } from '../components/ui';
import { matches, partial, strokesFor, type Pt } from '../lib/hangul';
import { useProgress } from '../lib/progress';
import { speak } from '../lib/speech';
import { useNav } from '../nav';

const sayKo = (t: string) => speak([{ text: t, lang: 'ko-KR', rate: 0.7 }]);

/** Stroke-order practice: trace each syllable stroke by stroke on a guided grid. */
export function Trace({ storyId }: { storyId: string }) {
  const { p, addWord } = useProgress();
  const nav = useNav();
  const st = findStory(storyId);
  const words = useMemo(() => st.words.filter((w) => syllables(V[w].ko).every((c) => strokesFor(c))), [st]);
  const [wi, setWi] = useState(0);
  const [si, setSi] = useState(0);
  const [round, setRound] = useState(0); // bumps to restart the current syllable
  const [demoTick, setDemoTick] = useState(0);
  const [msg, setMsg] = useState<{ text: string; bad?: boolean }>({ text: '' });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const w = words[wi];

  useEffect(() => {
    if (!w) return;
    const sy = syllables(V[w].ko);
    const ch = sy[si];
    const ST = strokesFor(ch)!;
    const cv = canvasRef.current!;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const size = Math.min((cv.parentElement?.clientWidth ?? 340), 340);
    const dpr = window.devicePixelRatio || 1;
    cv.style.width = cv.style.height = `${size}px`;
    cv.width = cv.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const k = size / 100;
    const cs = getComputedStyle(document.documentElement);
    const col = (n: string) => cs.getPropertyValue(n).trim();
    const C = { ink: col('--ink'), line: col('--line'), sun: col('--sun'), sunInk: col('--sun-ink'), card: col('--card'), leaf: col('--leaf'), bad: '#E06A55' };
    const W = size * 0.075;

    let stroke = 0;
    let miss = 0;
    let busy = false;
    let raf = 0;
    let trail: Pt[] | null = null;
    let badTrail: Pt[] | null = null;
    const timers: number[] = [];

    const path = (pts: Pt[], c: string, lw = W) => {
      if (pts.length < 2) return;
      ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(pts[0][0] * k, pts[0][1] * k);
      pts.slice(1).forEach((q) => ctx.lineTo(q[0] * k, q[1] * k));
      ctx.stroke();
    };
    const dot = (pt: Pt, n: number) => {
      ctx.fillStyle = C.sun; ctx.beginPath(); ctx.arc(pt[0] * k, pt[1] * k, size * 0.045, 0, 7); ctx.fill();
      ctx.fillStyle = C.sunInk; ctx.font = `700 ${size * 0.05}px Nunito, system-ui`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(n), pt[0] * k, pt[1] * k + 1);
    };
    const arrow = (pts: Pt[]) => {
      const a = pts[pts.length - 2], b = pts[pts.length - 1];
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), r = size * 0.05;
      ctx.fillStyle = C.sun; ctx.beginPath();
      ctx.moveTo(b[0] * k + Math.cos(ang) * r, b[1] * k + Math.sin(ang) * r);
      ctx.lineTo(b[0] * k + Math.cos(ang + 2.4) * r, b[1] * k + Math.sin(ang + 2.4) * r);
      ctx.lineTo(b[0] * k + Math.cos(ang - 2.4) * r, b[1] * k + Math.sin(ang - 2.4) * r);
      ctx.fill();
    };
    const base = () => {
      ctx.clearRect(0, 0, size, size); ctx.fillStyle = C.card; ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; ctx.setLineDash([6, 6]); ctx.beginPath();
      ctx.moveTo(size / 2, 0); ctx.lineTo(size / 2, size); ctx.moveTo(0, size / 2); ctx.lineTo(size, size / 2); ctx.stroke();
      ctx.setLineDash([]); ctx.lineWidth = 3; ctx.strokeRect(1.5, 1.5, size - 3, size - 3);
      ST.forEach((s) => path(s, C.line));
    };
    const draw = () => {
      base();
      ST.slice(0, stroke).forEach((s) => path(s, C.ink));
      if (stroke < ST.length) { const s = ST[stroke]; path(s, C.sun, W * 0.35); arrow(s); dot(s[0], stroke + 1); }
      if (badTrail) path(badTrail, C.bad, W * 0.6);
      if (trail) path(trail, C.leaf, W * 0.8);
    };
    const hint = () => setMsg({ text: `${ST.length}획 중 ${stroke + 1}번째 획 · 노란 숫자에서 시작해 화살표 쪽으로 그어요` });

    const demo = () => {
      cancelAnimationFrame(raf); busy = true;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        base(); ST.forEach((s, i) => { path(s, C.ink); dot(s[0], i + 1); });
        timers.push(window.setTimeout(() => { busy = false; draw(); }, 1800));
        return;
      }
      let i = 0; let t0: number | null = null; const per = 650;
      const step = (ts: number) => {
        if (t0 == null) t0 = ts;
        const t = Math.min(1, (ts - t0) / per);
        base(); ST.slice(0, i).forEach((s, j) => { path(s, C.ink); dot(s[0], j + 1); });
        path(partial(ST[i], t), C.ink); dot(ST[i][0], i + 1);
        if (t < 1) raf = requestAnimationFrame(step);
        else { i++; t0 = null; if (i < ST.length) raf = requestAnimationFrame(step); else timers.push(window.setTimeout(() => { busy = false; draw(); }, 600)); }
      };
      raf = requestAnimationFrame(step);
    };

    const pt = (e: PointerEvent): Pt => { const r = cv.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100]; };
    const down = (e: PointerEvent) => {
      if (busy || stroke >= ST.length) return;
      e.preventDefault(); cv.setPointerCapture(e.pointerId); trail = [pt(e)]; badTrail = null; draw();
    };
    const move = (e: PointerEvent) => { if (!trail) return; trail.push(pt(e)); draw(); };
    const up = () => {
      if (!trail) return;
      const u = trail; trail = null;
      if (matches(u, ST[stroke])) {
        stroke++; miss = 0; draw();
        if (stroke >= ST.length) {
          setMsg({ text: `“${ch}” 다 썼어요! ${UI[p.lang].ok}` });
          sayKo(ch);
          timers.push(window.setTimeout(() => {
            setDemoTick(0);
            if (si + 1 < sy.length) setSi(si + 1);
            else { sayKo(V[w].ko); addWord('traced', w); setSi(0); setWi((x) => x + 1); }
          }, 1100));
        } else hint();
      } else {
        miss++; badTrail = u; draw();
        setMsg({ text: miss >= 3 ? '획순을 다시 보여 줄게요. 잘 보고 따라 해요.' : '다시 해 볼까요? 노란 숫자에서 시작해 화살표 쪽으로 그어요.', bad: true });
        timers.push(window.setTimeout(() => { badTrail = null; if (!busy) draw(); }, 700));
        if (miss >= 3) { miss = 0; timers.push(window.setTimeout(demo, 400)); }
      }
    };
    const cancel = () => { trail = null; draw(); };

    cv.addEventListener('pointerdown', down);
    cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', cancel);
    hint(); draw();
    if (demoTick) demo();

    return () => {
      cancelAnimationFrame(raf); timers.forEach(clearTimeout);
      cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move);
      cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', cancel);
    };
  }, [w, si, round, demoTick, p.lang, addWord]);

  if (!w) {
    return (
      <>
        <TopBar />
        <header className="stack result-head">
          <Illus name="celebrate" className="illus celebrate-art" />
          <h1>따라 쓰기를 마쳤어요!</h1>
          <p className="lead" lang={p.lang}>{UI[p.lang].ok}</p>
        </header>
        <section>
          <p className="label">따라 쓴 낱말 · 눌러서 들어요</p>
          <div className="wbook">{words.map((id) => <WordCard key={id} id={id} />)}</div>
        </section>
        <div className="stack">
          <button className="play" onClick={() => nav({ view: 'dict', story: st.id })}>✎ 이제 받아쓰기 해 봐요</button>
          <button className="btn2" onClick={() => { setWi(0); setSi(0); }}>다시 따라 쓰기</button>
          <button className="btn2" onClick={() => nav({ view: 'home' })}>책장으로</button>
        </div>
      </>
    );
  }

  const sy = syllables(V[w].ko);
  return (
    <>
      <TopBar label="✕ 그만하기" tab="study" />
      <Progress label="따라 쓰기 · 획순" i={wi} n={words.length} />
      <div className="tword">
        <div className="tw-tile"><Tile id={w} /></div>
        <div>
          <p className="tw-ko">
            {sy.map((c, i) => <span key={i} className={i < si ? 'ok' : i === si ? 'cur' : ''}>{c}</span>)}
          </p>
          <p className="lead" lang={p.lang}>{V[w][p.lang]}</p>
        </div>
        <button className="btn2" aria-label="소리 듣기" onClick={() => sayKo(V[w].ko)}>▶</button>
      </div>
      <div className="pad">
        <canvas ref={canvasRef} role="img" aria-label={`${sy[si]} 글자를 획순대로 따라 쓰는 칸`} />
      </div>
      <p className="fb" style={{ color: msg.bad ? '#E06A55' : undefined }}>{msg.text}</p>
      <div className="tools">
        <button className="btn2" onClick={() => setDemoTick((t) => t + 1)}>▶ 획순 보기</button>
        <button className="btn2" onClick={() => { setDemoTick(0); setRound((x) => x + 1); }}>이 글자 다시</button>
      </div>
    </>
  );
}
