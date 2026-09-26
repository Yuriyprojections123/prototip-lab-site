// FDM vs SLA: the same dome cross-section built from 0.2 mm beads (FDM) and 0.05 mm layers (SLA),
// split by a draggable divider, with a loupe that follows the pointer.
const FDM_LAYER = 0.2, SLA_LAYER = 0.05; // mm — typical for the technologies
// «Спектр»: ink stage, FDM in orange filament beads, SLA in cyan resin, white ideal-surface line
const STAGE = '#16181f', PLATE = '#0b0c10', TICK = '#3a3e4b', IDEAL = '#ffffff', RING = '#ffffff';
const FDM_COL = ['#ff6a1a', '#e2540c'], SLA_COL = ['#00c2ff', '#12b0e6'];

export default function initCompare(root: HTMLElement) {
  const view = root.querySelector<HTMLElement>('.compare__view')!;
  const canvas = root.querySelector<HTMLCanvasElement>('canvas')!;
  const handle = root.querySelector<HTMLElement>('[data-handle]')!;
  const ctx = canvas.getContext('2d')!;
  const fdm = document.createElement('canvas');
  const sla = document.createElement('canvas');
  let W = 0, H = 0, dpr = 1, split = 0.5, loupe: { x: number; y: number } | null = null, raf = 0;

  // geometry: a dome 40 mm tall, 60 mm wide, drawn so 1 mm = k px
  function paintPart(c: HTMLCanvasElement, layer: number, bead: boolean, col: string[]) {
    const g = c.getContext('2d')!;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = STAGE; g.fillRect(0, 0, c.width, c.height);
    const k = (c.height * 0.72) / 40;
    const cx = c.width / 2, base = c.height * 0.88, R = 30, Hh = 40;
    // build plate
    g.fillStyle = PLATE; g.fillRect(0, base, c.width, c.height - base);
    g.fillStyle = TICK;
    for (let x = 0; x < c.width; x += 18 * dpr) g.fillRect(x, base + 6 * dpr, 1 * dpr, 6 * dpr);
    // layers
    const n = Math.round(Hh / layer);
    const lh = layer * k;
    for (let i = 0; i < n; i++) {
      const yMid = (i + 0.5) * layer;
      const half = R * Math.sqrt(Math.max(0, 1 - Math.pow(yMid / Hh, 2)));
      const w = half * 2 * k;
      const y = base - (i + 1) * lh;
      g.fillStyle = col[i % 2];
      if (bead && lh > 3) {
        const r = lh / 2;
        g.beginPath();
        g.roundRect(cx - w / 2, y, w, lh, r);
        g.fill();
      } else {
        g.fillRect(cx - w / 2, y, w, lh + 0.5);
      }
    }
    // ideal surface — dashed reference line
    g.strokeStyle = IDEAL; g.lineWidth = 1.5 * dpr; g.setLineDash([6 * dpr, 5 * dpr]);
    g.beginPath();
    for (let a = 0; a <= Math.PI; a += Math.PI / 180) {
      const x = cx + Math.cos(a) * R * k, y = base - Math.sin(a) * Hh * k;
      a === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    g.stroke(); g.setLineDash([]);
  }

  function resize() {
    const r = view.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio, 2);
    W = Math.round(r.width * dpr); H = Math.round(r.height * dpr);
    for (const c of [canvas, fdm, sla]) { c.width = W; c.height = H; }
    paintPart(fdm, FDM_LAYER, true, FDM_COL);
    paintPart(sla, SLA_LAYER, false, SLA_COL);
    draw();
  }

  function draw() {
    raf = 0;
    const sx = Math.round(W * split);
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(fdm, 0, 0, sx, H, 0, 0, sx, H);
    ctx.drawImage(sla, sx, 0, W - sx, H, sx, 0, W - sx, H);
    if (loupe) {
      const lx = loupe.x * dpr, ly = loupe.y * dpr, rad = 84 * dpr, z = 3;
      const src = lx < sx ? fdm : sla;
      ctx.save();
      ctx.beginPath(); ctx.arc(lx, ly, rad, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = STAGE; ctx.fillRect(lx - rad, ly - rad, rad * 2, rad * 2);
      ctx.drawImage(src, lx - rad / z, ly - rad / z, (rad * 2) / z, (rad * 2) / z, lx - rad, ly - rad, rad * 2, rad * 2);
      ctx.restore();
      ctx.strokeStyle = RING; ctx.lineWidth = 2 * dpr;
      ctx.beginPath(); ctx.arc(lx, ly, rad, 0, Math.PI * 2); ctx.stroke();
    }
    handle.style.left = `${split * 100}%`;
    const v = Math.round(split * 100);
    handle.setAttribute('aria-valuenow', String(v));
    handle.setAttribute('aria-valuetext', `${v}% — FDM слева, SLA справа`);
  }
  const schedule = () => { if (!raf) raf = requestAnimationFrame(draw); };

  // divider drag
  let dragging = false;
  const setFromX = (clientX: number) => {
    const r = view.getBoundingClientRect();
    split = Math.min(0.95, Math.max(0.05, (clientX - r.left) / r.width));
    schedule();
  };
  handle.addEventListener('pointerdown', (e) => { dragging = true; handle.setPointerCapture(e.pointerId); });
  handle.addEventListener('pointermove', (e) => { if (dragging) setFromX(e.clientX); });
  handle.addEventListener('pointerup', () => { dragging = false; });
  handle.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 0.1 : 0.02;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') split = Math.max(0.05, split - step);
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') split = Math.min(0.95, split + step);
    else if (e.key === 'Home') split = 0.05;
    else if (e.key === 'End') split = 0.95;
    else return;
    e.preventDefault(); schedule();
  });
  view.addEventListener('click', (e) => { if (e.target === canvas) setFromX(e.clientX); });

  // loupe — fine pointers only
  if (matchMedia('(hover: hover)').matches) {
    view.addEventListener('pointermove', (e) => {
      if (dragging) { loupe = null; schedule(); return; }
      const r = view.getBoundingClientRect();
      loupe = { x: e.clientX - r.left, y: e.clientY - r.top }; schedule();
    });
    view.addEventListener('pointerleave', () => { loupe = null; schedule(); });
  }

  // table toggle
  const table = root.querySelector('table');
  const chips = [...root.querySelectorAll<HTMLButtonElement>('[data-col]')];
  chips.forEach((b) => b.addEventListener('click', () => {
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
    table?.setAttribute('data-show', b.dataset.col!);
  }));

  new ResizeObserver(resize).observe(view);
  resize();
  root.classList.add('is-ready');
}
