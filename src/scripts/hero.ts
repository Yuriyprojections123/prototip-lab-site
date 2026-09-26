// Home hero: the sample object you can rotate, with four material states.
// Auto-plays wire → print → primer → paint once, then waits for the visitor.
import { canRun3D } from './object/capability';

const STATES = [1, 2, 3, 4]; // Каркас, Печать, Грунт, Покраска

export default async function initHero(el: HTMLElement) {
  const buttons = [...el.querySelectorAll<HTMLButtonElement>('[data-state]')];
  const counter = el.querySelector<HTMLElement>('[data-layer]');
  const fallback = el.querySelector<HTMLElement>('[data-fallback]');
  const canvas = el.querySelector<HTMLCanvasElement>('canvas');

  const press = (idx: number) => buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === idx)));

  if (!canvas || !canRun3D()) {
    // static SVG variants swap per state
    el.classList.add('is-static');
    buttons.forEach((b, i) => b.addEventListener('click', () => {
      press(i);
      fallback?.setAttribute('data-show', String(STATES[i]));
      if (counter) counter.textContent = ['Каркас · 36 × 44 рёбер', 'Слой 412 / 412', 'Грунт · слои зашлифованы', 'Покраска · сатин + янтарная вставка'][i];
    }));
    return;
  }

  const { createSample } = await import('./object/sample');
  const { gsap } = await import('gsap');
  const s = createSample(canvas);
  el.classList.add('is-live');

  // rotation: drag with inertia, idle turn, cursor tilt
  let rotY = -0.5, velY = 0, dragging = false, lastX = 0, tiltX = 0, tiltTarget = 0;
  const idle = 0.0022;
  canvas.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); el.classList.add('is-dragging'); });
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    tiltTarget = ((e.clientY - r.top) / r.height - 0.5) * 0.16;
    if (!dragging) return;
    velY = (e.clientX - lastX) * 0.008; lastX = e.clientX; rotY += velY;
  });
  const endDrag = () => { dragging = false; el.classList.remove('is-dragging'); };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('pointerleave', () => { tiltTarget = 0; });
  canvas.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { velY = -0.06; e.preventDefault(); }
    if (e.key === 'ArrowRight') { velY = 0.06; e.preventDefault(); }
  });

  // state machine
  const proxy = { s: 0 };
  let current = -1;
  const updateCounter = () => {
    if (!counter) return;
    const v = proxy.s;
    if (v <= 1.02) counter.textContent = 'Каркас · 36 × 44 рёбер';
    else if (v < 2) { const l = s.layerInfo(); counter.textContent = `Слой ${String(l.layer).padStart(3, '0')} / ${l.total}`; }
    else if (v < 2.5) counter.textContent = 'Слой 412 / 412 · снято с платформы';
    else if (v < 3.5) counter.textContent = 'Грунт · слои зашлифованы';
    else counter.textContent = 'Покраска · сатин + янтарная вставка';
  };
  const go = (idx: number, auto = false) => {
    current = idx;
    press(idx);
    const to = STATES[idx];
    const dur = to === 2 && proxy.s < 2 ? 3.2 : 1.1;
    return gsap.to(proxy, { s: to, duration: auto && to === 1 ? 0.9 : dur, ease: to === 2 ? 'none' : 'expo.out', overwrite: true,
      onUpdate: () => { s.setStage(proxy.s); updateCounter(); } });
  };
  buttons.forEach((b, i) => b.addEventListener('click', () => { autoplay.kill(); go(i); }));

  s.setStage(0);
  const autoplay = gsap.timeline({ delay: 0.3 });
  autoplay.add(() => { go(0, true); }).add(() => { go(1, true); }, '+=1.1').add(() => { go(2, true); }, '+=3.6').add(() => { go(3, true); }, '+=1.5');

  // render loop — only while visible
  let running = false, raf = 0;
  const loop = () => {
    if (!running) return;
    if (!dragging) { velY *= 0.94; rotY += velY + idle; }
    tiltX += (tiltTarget - tiltX) * 0.06;
    s.spin.rotation.y = rotY;
    s.root.rotation.x = tiltX;
    s.render();
    raf = requestAnimationFrame(loop);
  };
  const start = () => { if (!running) { running = true; raf = requestAnimationFrame(loop); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };
  new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? start() : stop())).observe(el);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  addEventListener('resize', () => s.resize());
  start();
  void current;
}
