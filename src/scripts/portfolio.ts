// Portfolio filter: chips toggle a category, items re-flow with FLIP (expo-out), state lives in ?cat=.
export default function initPortfolio(root: HTMLElement) {
  const chips = [...root.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const items = [...root.querySelectorAll<HTMLElement>('[data-cat]')];
  const count = root.querySelector<HTMLElement>('[data-count]');
  const empty = root.querySelector<HTMLElement>('[data-empty]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const apply = (cat: string, push = true) => {
    const first = new Map(items.map((el) => [el, el.getBoundingClientRect()]));
    let shown = 0;
    items.forEach((el) => {
      const on = cat === 'all' || el.dataset.cat === cat;
      el.hidden = !on;
      if (on) shown++;
    });
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.filter === cat)));
    if (count) count.textContent = String(shown).padStart(2, '0');
    if (empty) empty.hidden = shown > 0;
    if (push) {
      const u = new URL(location.href);
      if (cat === 'all') u.searchParams.delete('cat'); else u.searchParams.set('cat', cat);
      history.replaceState(null, '', u);
    }
    if (reduced) return;
    items.forEach((el) => {
      if (el.hidden) return;
      const a = first.get(el)!, b = el.getBoundingClientRect();
      const wasHidden = a.width === 0;
      const dx = a.left - b.left, dy = a.top - b.top;
      el.animate(
        wasHidden
          ? [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }]
          : [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
        { duration: 700, easing: 'cubic-bezier(0.19, 1, 0.22, 1)' },
      );
    });
  };

  chips.forEach((c) => c.addEventListener('click', () => apply(c.dataset.filter!)));
  const initial = new URL(location.href).searchParams.get('cat');
  if (initial && chips.some((c) => c.dataset.filter === initial)) apply(initial, false);
}
