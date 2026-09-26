// «Образец» — the studio's procedural sample object: a turned award/vessel form with a chamfered plinth,
// a waist, a swelling body and a lipped neck. Shared by the three.js scene and the static SVG fallback,
// so both show the same silhouette. Units: radius x, height y (0..HEIGHT).

export const HEIGHT = 2.4;
export const INLAY_Y = 1.18; // amber inlay ring height in the painted state

// control points [radius, y], bottom → top
const control: [number, number][] = [
  [0.001, 0], [0.92, 0], [0.96, 0.04], [0.96, 0.17], [0.9, 0.23],
  [0.5, 0.27], [0.4, 0.36], [0.38, 0.5],
  [0.5, 0.78], [0.66, 1.1], [0.69, 1.3], [0.63, 1.58], [0.48, 1.86],
  [0.33, 2.08], [0.29, 2.22], [0.37, 2.3], [0.37, 2.36], [0.26, 2.4], [0.001, 2.4],
];
// indices that must stay sharp (chamfers of the plinth, lip)
const sharp = new Set([1, 2, 3, 4, 5, 15, 16, 17]);

function catmull(p0: number, p1: number, p2: number, p3: number, t: number) {
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

/** Dense profile, smooth between soft points, straight into sharp ones. */
export function profilePoints(stepsPerSpan = 6): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < control.length - 1; i++) {
    const a = control[i], b = control[i + 1];
    const straight = sharp.has(i) || sharp.has(i + 1);
    const n = straight ? 1 : stepsPerSpan;
    const p0 = control[Math.max(0, i - 1)], p3 = control[Math.min(control.length - 1, i + 2)];
    for (let s = 0; s < n; s++) {
      const t = s / n;
      out.push(straight
        ? [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
        : [catmull(p0[0], a[0], b[0], p3[0], t), catmull(p0[1], a[1], b[1], p3[1], t)]);
    }
  }
  out.push(control[control.length - 1]);
  return out;
}

/** Outer radius at height y (max over the profile), used to size the nozzle ring. */
export function radiusAt(y: number, pts = profilePoints()): number {
  let r = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [r0, y0] = pts[i], [r1, y1] = pts[i + 1];
    if ((y >= y0 && y <= y1) || (y >= y1 && y <= y0)) {
      const t = y1 === y0 ? 0 : (y - y0) / (y1 - y0);
      r = Math.max(r, r0 + (r1 - r0) * t);
    }
  }
  return r;
}

/** SVG path of the full silhouette (mirrored profile), in a viewBox of width w, height h. */
export function silhouettePath(w = 400, h = 460, pad = 30): string {
  const pts = profilePoints(8);
  const scale = (h - pad * 2) / HEIGHT;
  const cx = w / 2;
  const X = (r: number, side: number) => (cx + side * r * scale).toFixed(1);
  const Y = (y: number) => (h - pad - y * scale).toFixed(1);
  const right = pts.map(([r, y]) => `${X(r, 1)},${Y(y)}`);
  const left = [...pts].reverse().map(([r, y]) => `${X(r, -1)},${Y(y)}`);
  return `M${right.join('L')}L${left.join('L')}Z`;
}

export function svgScale(h = 460, pad = 30) { return (h - pad * 2) / HEIGHT; }
