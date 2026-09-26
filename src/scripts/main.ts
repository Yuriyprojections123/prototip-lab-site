// Global client behaviour. Heavy modules (three.js, GSAP) are imported only on pages that use them.
import 'lenis/dist/lenis.css';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- masked line reveals (reference: headings rise line by line from a mask) ---------- */
function splitLines(el: HTMLElement) {
  if (!el.dataset.src) el.dataset.src = el.innerHTML;
  el.innerHTML = el.dataset.src;
  const tokens: HTMLElement[] = [];
  const nodes = [...el.childNodes];
  el.textContent = '';
  for (const n of nodes) {
    if (n.nodeType === Node.TEXT_NODE) {
      for (const w of (n.textContent ?? '').split(/\s+/).filter(Boolean)) {
        const s = document.createElement('span');
        s.textContent = w;
        tokens.push(s);
      }
    } else if (n instanceof HTMLBRElement) {
      const br = document.createElement('span');
      br.dataset.br = '1';
      tokens.push(br);
    } else if (n instanceof HTMLElement) {
      // inline element (e.g. an accent span): split its words but keep its class on each
      for (const w of (n.textContent ?? '').split(/\s+/).filter(Boolean)) {
        const s = n.cloneNode(false) as HTMLElement;
        s.textContent = w;
        tokens.push(s);
      }
    }
  }
  const measure = document.createElement('span');
  for (const t of tokens) { measure.append(t, ' '); }
  el.append(measure);
  const lines: HTMLElement[][] = [];
  let top = -1;
  let forceNew = false;
  for (const t of tokens) {
    if (t.dataset.br) { forceNew = true; continue; }
    const y = t.offsetTop;
    if (forceNew || lines.length === 0 || Math.abs(y - top) > 4) { lines.push([]); top = y; forceNew = false; }
    lines[lines.length - 1].push(t);
  }
  el.textContent = '';
  lines.forEach((line, i) => {
    const outer = document.createElement('span');
    outer.className = 'reveal-line';
    const inner = document.createElement('span');
    inner.style.transitionDelay = `${i * 0.08}s`;
    line.forEach((t, j) => { inner.append(t); if (j < line.length - 1) inner.append(' '); });
    outer.append(inner);
    el.append(outer);
  });
}

const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
}, { rootMargin: '0px 0px -8% 0px' });

function initReveals() {
  const lineEls = [...document.querySelectorAll<HTMLElement>('[data-reveal="lines"]')];
  document.fonts.ready.then(() => {
    lineEls.forEach(splitLines);
    let w = innerWidth;
    addEventListener('resize', () => {
      if (Math.abs(innerWidth - w) < 40) return;
      w = innerWidth;
      lineEls.forEach((el) => { splitLines(el); });
    });
  });
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    if (reduced) el.classList.add('is-in'); else io.observe(el);
  });
}

/* ---------- header: solid after scroll, hides on scroll down, morphs colour over dark chapters ---------- */
function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;
  const darkEls = () => [...document.querySelectorAll<HTMLElement>('.chapter--dark, [data-dark]')];
  let darks = darkEls();
  let lastY = scrollY;
  let ticking = false;
  const mid = 36;
  const update = () => {
    ticking = false;
    const y = scrollY;
    header.classList.toggle('is-solid', y > 40);
    const hide = y > 480 && y > lastY + 2 && !document.body.classList.contains('menu-open');
    if (hide) header.classList.add('is-hidden');
    else if (y < lastY - 2 || y < 480) header.classList.remove('is-hidden');
    lastY = y;
    const onDark = darks.some((d) => { const r = d.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid; });
    header.classList.toggle('is-dark', onDark);
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', () => { darks = darkEls(); update(); });
  update();
}

/* ---------- mobile menu: dialog semantics, focus trap, Esc ---------- */
function initMenu() {
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  const openBtn = document.querySelector<HTMLButtonElement>('[data-menu-open]');
  const closeBtn = document.querySelector<HTMLButtonElement>('[data-menu-close]');
  if (!menu || !openBtn || !closeBtn) return;
  const focusables = () => [...menu.querySelectorAll<HTMLElement>('a, button')];
  const open = () => {
    menu.hidden = false; openBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open'); document.body.style.overflow = 'hidden';
    (window as any).__lenis?.stop();
    closeBtn.focus();
  };
  const close = () => {
    menu.hidden = true; openBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open'); document.body.style.overflow = '';
    (window as any).__lenis?.start();
    openBtn.focus();
  };
  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  menu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const f = focusables(); const first = f[0]; const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => { document.body.style.overflow = ''; }));
}

/* ---------- smooth scroll (reference: Lenis) — fine pointers only ---------- */
async function initLenis() {
  if (reduced || !finePointer) return;
  const { default: Lenis } = await import('lenis');
  const lenis = new Lenis({ duration: 1.1, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
  (window as any).__lenis = lenis;
  const raf = (t: number) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  document.dispatchEvent(new CustomEvent('lenis:ready'));
}

/* ---------- first-visit loader (home only): mono counter tied to real readiness ---------- */
function initLoader() {
  const el = document.querySelector<HTMLElement>('[data-loader]');
  if (!el) return;
  const out = el.querySelector('[data-loader-count]');
  const start = performance.now();
  let done = false;
  document.fonts.ready.then(() => { done = true; });
  const max = 900;
  const tick = (t: number) => {
    const p = Math.min(1, (t - start) / max);
    const shown = done ? p : Math.min(p, 0.8);
    if (out) out.textContent = String(Math.round(shown * 100)).padStart(3, '0');
    if (shown >= 1 || t - start > 1600) {
      el.classList.add('is-done');
      sessionStorage.setItem('pl-seen', '1');
      setTimeout(() => el.remove(), 900);
      return;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ---------- lazy modules ---------- */
function lazy(selector: string, load: () => Promise<{ default: (el: HTMLElement) => void }>, margin = '200px') {
  const els = document.querySelectorAll<HTMLElement>(selector);
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      obs.unobserve(e.target);
      load().then((m) => m.default(e.target as HTMLElement));
    }
  }, { rootMargin: margin });
  els.forEach((el) => obs.observe(el));
}

initLoader();
initReveals();
initHeader();
initMenu();
initLenis();
lazy('[data-hero-object]', () => import('./hero'), '0px');
lazy('[data-process]', () => import('./process'), '400px');
lazy('[data-compare]', () => import('./compare'));
lazy('[data-index-hover]', () => import('./index-hover'));
lazy('[data-portfolio]', () => import('./portfolio'), '0px');
lazy('[data-quote]', () => import('./quote'), '0px');
