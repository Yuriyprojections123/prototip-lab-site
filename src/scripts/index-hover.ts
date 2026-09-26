// Services index: an image preview follows the cursor with lag (fine pointers only).
export default function initIndexHover(list: HTMLElement) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const float = list.closest('section')?.querySelector<HTMLElement>('.svc__float');
  const img = float?.querySelector('img');
  if (!float || !img) return;
  let x = 0, y = 0, cx = 0, cy = 0, raf = 0;
  const tick = () => {
    cx += (x - cx) * 0.14; cy += (y - cy) * 0.14;
    float.style.transform = `translate3d(${cx + 28}px, ${cy - 100}px, 0) rotate(${(x - cx) * 0.02}deg)`;
    raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.3 ? requestAnimationFrame(tick) : 0;
  };
  list.querySelectorAll<HTMLAnchorElement>('[data-preview]').forEach((a) => {
    a.addEventListener('pointerenter', (e) => {
      if (img.getAttribute('src') !== a.dataset.preview) img.src = a.dataset.preview!;
      if (!float.classList.contains('is-on')) { cx = x = e.clientX; cy = y = e.clientY; }
      float.classList.add('is-on');
    });
    a.addEventListener('pointerleave', () => float.classList.remove('is-on'));
  });
  list.addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(tick); });
  addEventListener('scroll', () => float.classList.remove('is-on'), { passive: true });
}
