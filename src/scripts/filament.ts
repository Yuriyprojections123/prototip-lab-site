// The filament line (reference: the tube that draws itself through the page). A spectrum-coloured
// extrusion runs down the page edge and crosses to the other side at every chapter boundary; its length
// follows the scroll and a nozzle dot rides its head. Dark and deep chapters sit above it, so it
// passes behind the cards. The line only moves when the reader scrolls, so reduced motion keeps it too.
const NS = 'http://www.w3.org/2000/svg';
const STOPS = ['#00c2ff', '#2f5bff', '#ff2e8e', '#ff6a1a', '#ffc61a', '#b6f500'];

export default function initFilament(svg: SVGSVGElement) {
  const main = svg.parentElement as HTMLElement;
  let path: SVGPathElement, gloss: SVGPathElement, nozzle: SVGGElement;
  let len = 0, table: { l: number; x: number; y: number }[] = [], raf = 0, H = 0;

  const el = <K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>) => {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
    return e;
  };

  function build() {
    const W = main.clientWidth;
    H = main.scrollHeight;
    const mTop = main.getBoundingClientRect().top + scrollY;
    const mobile = W < 768;
    const stroke = mobile ? 9 : 16;
    const edge = mobile ? 8 : Math.max(14, parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--margin')) * 0.5 || 16);
    const xs = [edge, W - edge];

    // chapter boundaries (skip tiny gaps between stacked cards)
    const chapters = [...main.querySelectorAll<HTMLElement>(':scope > section, :scope > .chapter, :scope > article > .chapter, :scope > article > header, :scope > article > nav, :scope > div.chapter')]
      .filter((c) => c.offsetHeight > 120);
    const bounds: number[] = [];
    chapters.forEach((c, i) => {
      if (i === 0) return;
      const y = c.getBoundingClientRect().top + scrollY - mTop;
      if (!bounds.length || y - bounds[bounds.length - 1] > 240) bounds.push(y);
    });
    const start = chapters[0] ? Math.min(chapters[0].offsetHeight * 0.55, 700) : 200;

    let side = 1;
    let d = `M ${xs[side]} ${start}`;
    for (const b of bounds) {
      const span = mobile ? 90 : 150;
      const y0 = b - span, y1 = b + span;
      if (y0 < start) continue;
      d += ` L ${xs[side]} ${y0}`;
      const next = 1 - side;
      d += ` C ${xs[side]} ${b}, ${xs[next]} ${b}, ${xs[next]} ${y1}`;
      side = next;
    }
    d += ` L ${xs[side]} ${H - 40}`;

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', String(W));
    svg.setAttribute('height', String(H));
    svg.textContent = '';
    const defs = el('defs', {});
    const grad = el('linearGradient', { id: 'fil-grad', gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 0, y2: H });
    const cycles = Math.max(2, Math.round(H / 1400));
    for (let c = 0; c <= cycles * STOPS.length; c++) {
      grad.append(el('stop', { offset: (c / (cycles * STOPS.length)).toFixed(4), 'stop-color': STOPS[c % STOPS.length] }));
    }
    defs.append(grad);
    svg.append(defs);
    path = el('path', { d, fill: 'none', stroke: 'url(#fil-grad)', 'stroke-width': stroke, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    gloss = el('path', { d, fill: 'none', stroke: '#fff', 'stroke-opacity': 0.45, 'stroke-width': Math.max(2, stroke * 0.22), 'stroke-linecap': 'round', transform: `translate(${-stroke * 0.18} ${-stroke * 0.18})` });
    svg.append(path, gloss);
    nozzle = el('g', {});
    nozzle.append(el('circle', { r: stroke * 0.95, fill: '#0b0c10' }), el('circle', { r: stroke * 0.38, fill: '#fff' }));
    svg.append(nozzle);

    len = path.getTotalLength();
    table = [];
    const N = Math.min(1600, Math.ceil(len / 12));
    for (let i = 0; i <= N; i++) { const l = (len * i) / N; const pt = path.getPointAtLength(l); table.push({ l, x: pt.x, y: pt.y }); }
    for (const p of [path, gloss]) { p.style.strokeDasharray = `${len} ${len}`; }
    update();
  }

  // the nozzle position comes from the table: getPointAtLength walks the whole path and stalls phones mid-scroll
  function draw(l: number, i: number) {
    const off = String(Math.max(0, len - l));
    path.style.strokeDashoffset = off;
    gloss.style.strokeDashoffset = off;
    const p = table[i];
    nozzle.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
    nozzle.style.opacity = l < 2 || l >= len - 1 ? '0' : '1';
  }

  function update() {
    raf = 0;
    const mTop = main.getBoundingClientRect().top;
    const target = -mTop + innerHeight * 0.72;
    // first table entry whose y passes the target — the path only moves down, so y is monotonic
    let lo = 0, hi = table.length - 1;
    if (target <= table[0].y) return draw(0, 0);
    if (target >= table[hi].y) return draw(len, hi);
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (table[mid].y < target) lo = mid; else hi = mid; }
    draw(table[hi].l, hi);
  }

  build();
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  let w = innerWidth, t = 0;
  const rebuild = () => { clearTimeout(t); t = window.setTimeout(build, 180); };
  addEventListener('resize', () => { if (Math.abs(innerWidth - w) > 30) { w = innerWidth; rebuild(); } });
  new ResizeObserver(() => { if (Math.abs(main.scrollHeight - H) > 40) rebuild(); }).observe(main);
}
