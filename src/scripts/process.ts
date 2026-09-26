// Home process chapter: the sample object evolves through Идея → Модель → Печать → Постобработка → Готовое изделие
// as the visitor scrolls. Pinned with CSS sticky; progress read from the section rect each frame.
import { canRun3D } from './object/capability';

const LABELS = ['01 · Идея — эскиз профиля', '02 · Модель — каркас', '03 · Печать — слой за слоем', '04 · Постобработка — грунт', '05 · Готовое изделие'];

export default async function initProcess(el: HTMLElement) {
  if (innerWidth < 1024 || !canRun3D()) return; // list mode with static frames
  const canvas = el.querySelector<HTMLCanvasElement>('canvas');
  const sketch = el.querySelector<SVGPathElement>('[data-sketch] .obj__sketch');
  const sketchBox = el.querySelector<HTMLElement>('[data-sketch]');
  const readout = el.querySelector<HTMLElement>('[data-readout]');
  const rail = el.querySelector<HTMLElement>('[data-rail]');
  const steps = [...el.querySelectorAll<HTMLElement>('[data-step]')];
  if (!canvas) return;

  const { createSample } = await import('./object/sample');
  el.classList.add('is-live');
  const s = createSample(canvas, { dpr: 1.5 });
  s.setStage(0);

  let active = -1, running = false, raf = 0, lastP = -1;
  const frame = () => {
    if (!running) return;
    const r = el.getBoundingClientRect();
    const total = r.height - innerHeight;
    const p = Math.min(1, Math.max(0, -r.top / total));
    if (p !== lastP) {
      lastP = p;
      const stage = Math.min(4, Math.max(0, p * 5 - 0.6));
      s.setStage(stage);
      const idx = Math.min(4, Math.floor(p * 5));
      if (idx !== active) {
        active = idx;
        steps.forEach((st, i) => st.classList.toggle('is-active', i === idx));
        if (readout) readout.textContent = LABELS[idx];
      }
      if (sketch) sketch.style.strokeDashoffset = String(1 - Math.min(1, p * 6));
      if (sketchBox) sketchBox.style.opacity = String(1 - Math.min(1, Math.max(0, (stage - 0.7) / 0.5)));
      if (rail) rail.style.transform = `scaleX(${p})`;
      if (readout && stage > 1 && stage < 2) { const l = s.layerInfo(); readout.textContent = `03 · Печать — слой ${String(l.layer).padStart(3, '0')} / ${l.total}`; }
      s.spin.rotation.y = -0.6 + p * Math.PI * 1.15;
    }
    s.render();
    raf = requestAnimationFrame(frame);
  };
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { if (!running) { running = true; raf = requestAnimationFrame(frame); } }
    else { running = false; cancelAnimationFrame(raf); }
  }).observe(el);
  addEventListener('resize', () => { lastP = -1; s.resize(); });
}
