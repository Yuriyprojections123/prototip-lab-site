// Home process chapter: five coloured stage cards slide sideways while the section is pinned.
// Pinned with CSS sticky; progress read from the section rect each frame. Phones get the same chapter
// with one card per screen width. The movement follows the reader's scroll 1:1, so reduced motion keeps it.
// If the pinned screen does not fit the viewport (very large system font), the plain stack stays.
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

  let active = -1, running = false, raf = 0, lastP = -1, shift = 0;
  // desktop: the last card stops at 70% of the screen; phones: flush with the right edge
  const measure = () => { shift = Math.max(0, track.scrollWidth - innerWidth * (innerWidth < 768 ? 1 : 0.7)); };
  measure();
  const frame = () => {
    if (!running) return;
    const r = el.getBoundingClientRect();
    const total = r.height - innerHeight;
    const p = Math.min(1, Math.max(0, -r.top / total));
    if (p !== lastP) {
      lastP = p;
      track.style.transform = `translate3d(${(-p * shift).toFixed(1)}px, 0, 0)`;
      if (rail) rail.style.transform = `scaleX(${p})`;
      const idx = Math.min(steps.length - 1, Math.floor(p * steps.length * 0.999));
      if (idx !== active) {
        active = idx;
        steps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
        if (readout) readout.textContent = String(idx + 1).padStart(2, '0');
      }
    }
    raf = requestAnimationFrame(frame);
  };
  const start = () => { if (!running) { running = true; raf = requestAnimationFrame(frame); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };
  new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { rootMargin: '100px' }).observe(el);
  addEventListener('resize', () => {
    measure(); lastP = -1;
    if (!fits()) { stop(); el.classList.remove('is-live'); track.style.transform = ''; }
  });
}
