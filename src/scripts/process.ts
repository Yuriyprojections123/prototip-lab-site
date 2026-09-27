// Home process chapter: five coloured stage cards slide sideways while the section is pinned.
// Pinned with CSS sticky. Phones get the same chapter with one card per screen width. The movement follows
// the reader's scroll, so reduced motion keeps it. If the pinned screen does not fit the viewport (very
// large system font), the plain stack stays.
// Where the browser has scroll-driven animations, the slide and the rail run on the compositor
// (ProcessScroll.astro, .is-native) and JS only picks the active card; otherwise JS moves the track with
// a short ease so touch scrolling does not step.
export default function initProcess(el: HTMLElement) {
  const track = el.querySelector<HTMLElement>('[data-track]');
  const pin = el.querySelector<HTMLElement>('.process__pin');
  const rail = el.querySelector<HTMLElement>('[data-rail]');
  const readout = el.querySelector<HTMLElement>('[data-readout]');
  const steps = [...el.querySelectorAll<HTMLElement>('[data-step]')];
  if (!track || !pin) return;
  el.classList.add('is-live');
  // the pin is 100svh; content that does not fit would be cut off while pinned
  const fits = () => pin.scrollHeight <= pin.clientHeight + 2;
  if (!fits()) { el.classList.remove('is-live'); return; }

  const native = CSS.supports('animation-timeline: view()');
  if (native) el.classList.add('is-native');

  let active = -1, running = false, raf = 0, shift = 0, shown = -1;
  // desktop: the last card stops at 70% of the screen; phones: flush with the right edge
  const measure = () => {
    shift = Math.max(0, track.scrollWidth - innerWidth * (innerWidth < 768 ? 1 : 0.7));
    el.style.setProperty('--shift', `${shift}px`);
  };
  measure();

  const progress = () => {
    const r = el.getBoundingClientRect();
    return Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
  };
  const setActive = (p: number) => {
    const idx = Math.min(steps.length - 1, Math.floor(p * steps.length * 0.999));
    if (idx === active) return;
    active = idx;
    steps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
    if (readout) readout.textContent = String(idx + 1).padStart(2, '0');
  };

  const frame = () => {
    if (!running) return;
    const p = progress();
    setActive(p);
    if (!native) {
      // ease toward the scroll position; snap when close so the frame loop can rest
      shown = shown < 0 ? p : shown + (p - shown) * 0.28;
      if (Math.abs(p - shown) < 0.0005) shown = p;
      track.style.transform = `translate3d(${(-shown * shift).toFixed(1)}px, 0, 0)`;
      if (rail) rail.style.transform = `scaleX(${shown.toFixed(4)})`;
    }
    raf = requestAnimationFrame(frame);
  };
  const start = () => { if (!running) { running = true; raf = requestAnimationFrame(frame); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };
  new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { rootMargin: '100px' }).observe(el);
  addEventListener('resize', () => {
    measure(); shown = -1;
    if (!fits()) { stop(); el.classList.remove('is-live', 'is-native'); track.style.transform = ''; }
  });
}
