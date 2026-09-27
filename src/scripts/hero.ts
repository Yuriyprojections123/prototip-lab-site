// Home hero: a cluster of printed parts. On load it prints layer by layer, then settles in silk PLA.
// Pill toggles switch wireframe / print replay / silk PLA / resin SLA; the pointer pushes parts around,
// a click scatters them. Static still image when 3D is not a good idea (capability.ts).
import { canRun3D } from './object/capability';

const MODES = ['wire', 'print', 'silk', 'resin'] as const;
const READOUT = ['Каркас · 14 деталей', '', 'Шёлк PLA · слой 0,2 мм', 'Смола SLA · слой 0,05 мм'];

export default async function initHero(el: HTMLElement) {
  const buttons = [...el.querySelectorAll<HTMLButtonElement>('[data-state]')];
  const counter = el.querySelector<HTMLElement>('[data-layer]');
  const canvas = el.querySelector<HTMLCanvasElement>('canvas');
  const press = (idx: number) => buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === idx)));

  if (!canvas || !canRun3D()) {
    el.classList.add('is-static');
    buttons.forEach((b, i) => b.addEventListener('click', () => {
      press(i);
      if (counter) counter.textContent = i === 1 ? 'Слой 412 / 412' : READOUT[i];
    }));
    return;
  }

  const [{ createCluster, TOTAL_LAYERS }, { gsap }] = await Promise.all([import('./object/cluster'), import('gsap')]);
  const c = createCluster(canvas);
  el.classList.add('is-live');

  const proxy = { p: 0 };
  let tween: { kill: () => void } | null = null;
  const showLayer = () => { if (counter) counter.textContent = `Слой ${String(Math.max(1, Math.round(proxy.p * TOTAL_LAYERS))).padStart(3, '0')} / ${TOTAL_LAYERS}`; };

  const go = (idx: number) => {
    press(idx);
    tween?.kill();
    const m = MODES[idx];
    if (m === 'print') {
      c.setMode('silk');
      proxy.p = 0; c.setPrint(0); showLayer();
      tween = gsap.to(proxy, { p: 1, duration: 3.4, ease: 'power1.inOut', onUpdate: () => { c.setPrint(proxy.p); showLayer(); },
        onComplete: () => { if (counter) counter.textContent = `Слой ${TOTAL_LAYERS} / ${TOTAL_LAYERS} · готово`; } });
      return;
    }
    c.setPrint(1); proxy.p = 1;
    c.setMode(m);
    if (counter) counter.textContent = READOUT[idx];
  };
  buttons.forEach((b, i) => b.addEventListener('click', () => { autoplay?.kill(); go(i); }));

  // first run: print from an empty bed, then settle in silk (reduced motion: start settled)
  const autoplay = gsap.timeline({ delay: 0.25 });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) autoplay.add(() => go(2));
  else autoplay.add(() => go(1)).add(() => go(2), '+=3.7');

  // pointer: push parts, click scatters
  el.addEventListener('pointermove', (e) => c.pointer(e.clientX, e.clientY));
  el.addEventListener('pointerleave', () => c.leave());
  el.addEventListener('pointerdown', (e) => { if (!(e.target as HTMLElement).closest('button, a')) c.burst(e.clientX, e.clientY); });

  // render loop — only while visible
  let running = false, raf = 0, last = performance.now();
  const loop = (t: number) => {
    if (!running) return;
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    const r = el.getBoundingClientRect();
    c.setScroll(Math.min(1, Math.max(0, -r.top / r.height)));
    c.step(dt);
    c.render();
    raf = requestAnimationFrame(loop);
  };
  const start = () => { if (!running) { running = true; last = performance.now(); raf = requestAnimationFrame(loop); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };
  new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? start() : stop())).observe(el);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  new ResizeObserver(() => c.resize()).observe(canvas);
  c.setPrint(0);
  start();
}
