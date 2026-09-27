// Home process chapter: five coloured stage cards slide sideways while the section is pinned.
// Pinned with CSS sticky. The movement follows the reader's scroll, so reduced motion keeps it. If the pinned
// screen does not fit the viewport (very large system font), the plain stack stays.
// Wide screens: one continuous slide. Phones and tablets: the track steps from card to card — each card rests
// centred and whole for a stretch of scroll, then glides to the next — so no card is ever left half cut off.
// Where the browser has scroll-driven animations the track runs on the compositor (Web Animations on a
// ViewTimeline) and JS only picks the active card; otherwise JS moves it with a short ease.
const HOLD = 0.5; // share of each step spent resting on a card (phones)

export default function initProcess(el: HTMLElement) {
  const track = el.querySelector<HTMLElement>('[data-track]');
  const pin = el.querySelector<HTMLElement>('.process__pin');
  const rail = el.querySelector<HTMLElement>('[data-rail]');
  const readout = el.querySelector<HTMLElement>('[data-readout]');
  const steps = [...el.querySelectorAll<HTMLElement>('[data-step]')];
  if (!track || !pin || !steps.length) return;
  el.classList.add('is-live');
  // the pin is 100svh; content that does not fit would be cut off while pinned
  const fits = () => pin.scrollHeight <= pin.clientHeight + 2;
  if (!fits()) { el.classList.remove('is-live'); return; }

  const VT = (window as any).ViewTimeline;
  const native = !!VT && CSS.supports('animation-timeline: view()');
  if (native) el.classList.add('is-native');

  const n = steps.length;
  // homes[i]: track x at which card i is in place — left-aligned with the first card (wide) or centred (phones)
  let stepped = false, homes: number[] = [];
  // x of the track for a scroll progress p (0..1)
  const xAt = (p: number) => {
    if (!stepped) return p * homes[n - 1];
    const t = p * (n - 1), i = Math.min(n - 2, Math.floor(t)), f = t - i;
    // rest at both ends of the step, glide in the middle (smoothstep)
    const g = Math.min(1, Math.max(0, (f - HOLD / 2) / (1 - HOLD)));
    const e = g * g * (3 - 2 * g);
    return homes[i] + (homes[i + 1] - homes[i]) * e;
  };
  // the active card is the one nearest its home, so the highlighted card is always the one on screen
  const indexAt = (p: number) => {
    const x = xAt(p);
    let best = 0;
    homes.forEach((h, i) => { if (Math.abs(x - h) < Math.abs(x - homes[best])) best = i; });
    return best;
  };

  let anim: Animation | null = null;
  const measure = () => {
    stepped = innerWidth < 1024;
    // offsetLeft ignores the inactive-card scale; the slide ends with the last card where the first one began
    homes = steps.map((s) => Math.round(stepped ? (innerWidth - s.offsetWidth) / 2 - s.offsetLeft : steps[0].offsetLeft - s.offsetLeft));
    if (native) {
      anim?.cancel();
      const count = stepped ? 81 : 2;
      const frames = Array.from({ length: count }, (_, k) => ({ transform: `translate3d(${xAt(k / (count - 1)).toFixed(1)}px, 0, 0)` }));
      anim = track.animate(frames, {
        timeline: new VT({ subject: el, axis: 'block' }),
        rangeStart: 'contain 0%', rangeEnd: 'contain 100%', fill: 'both', easing: 'linear',
      } as any);
    }
  };
  measure();

  let active = -1, running = false, raf = 0, shown = -1;
  const progress = () => {
    const r = el.getBoundingClientRect();
    return Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
  };
  const frame = () => {
    if (!running) return;
    const p = progress();
    const idx = indexAt(p);
    if (idx !== active) {
      active = idx;
      steps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
      if (readout) readout.textContent = String(idx + 1).padStart(2, '0');
    }
    if (!native) {
      // ease toward the scroll position; snap when close so the frame loop can rest
      shown = shown < 0 ? p : shown + (p - shown) * 0.28;
      if (Math.abs(p - shown) < 0.0005) shown = p;
      track.style.transform = `translate3d(${xAt(shown).toFixed(1)}px, 0, 0)`;
      if (rail) rail.style.transform = `scaleX(${shown.toFixed(4)})`;
    }
    raf = requestAnimationFrame(frame);
  };
  const start = () => { if (!running) { running = true; raf = requestAnimationFrame(frame); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };
  new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { rootMargin: '100px' }).observe(el);
  // phone browsers fire resize when the address bar slides; only a width change moves the cards
  let w = innerWidth;
  addEventListener('resize', () => {
    if (!fits()) { stop(); anim?.cancel(); el.classList.remove('is-live', 'is-native'); track.style.transform = ''; return; }
    if (innerWidth === w) return;
    w = innerWidth; shown = -1; measure();
  });
}
