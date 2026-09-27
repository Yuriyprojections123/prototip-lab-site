// Procedural three.js scene for the home hero: a cluster of printed parts in filament colours.
// One shader patch serves every mode:
//   uPrint  — 0..1 height of the part already printed (fragments above are discarded, the cut glows)
//   uLayers — FDM layer ridges (0 = SLA-smooth, 1 = visible 0.2 mm-style layers)
// Parts float around home positions, are pushed by the pointer and bump into each other.
import {
  NeutralToneMapping, CapsuleGeometry, CatmullRomCurve3, Color, DirectionalLight, DoubleSide, ExtrudeGeometry,
  Group, IcosahedronGeometry, Mesh, MeshPhysicalMaterial, PerspectiveCamera, Plane, PMREMGenerator, PointLight, Raycaster,
  SRGBColorSpace, Scene, Shape, Path, TorusGeometry, TorusKnotGeometry, TubeGeometry, Vector2, Vector3, WebGLRenderer,
  type BufferGeometry,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export const FILAMENT = ['#00c2ff', '#2f5bff', '#ff2e8e', '#ff6a1a', '#ffc61a', '#b6f500'];
export const TOTAL_LAYERS = 412;

type Mode = 'wire' | 'silk' | 'resin';

/* ---------- geometry ---------- */
function gear(teeth = 12, r = 0.78, depth = 0.34) {
  const s = new Shape();
  const inner = r * 0.8;
  for (let i = 0; i < teeth * 4; i++) {
    const a = (i / (teeth * 4)) * Math.PI * 2;
    const rr = i % 4 === 1 || i % 4 === 2 ? r : inner;
    const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
    if (i === 0) s.moveTo(x, y); else s.lineTo(x, y);
  }
  const hole = new Path(); hole.absarc(0, 0, r * 0.3, 0, Math.PI * 2, true); s.holes.push(hole);
  const g = new ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 3, curveSegments: 24 });
  g.center();
  return g;
}
function hexNut(r = 0.62, depth = 0.46) {
  const s = new Shape();
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + Math.PI / 6; const x = Math.cos(a) * r, y = Math.sin(a) * r; if (i === 0) s.moveTo(x, y); else s.lineTo(x, y); }
  const hole = new Path(); hole.absarc(0, 0, r * 0.46, 0, Math.PI * 2, true); s.holes.push(hole);
  const g = new ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.06, bevelSegments: 4, curveSegments: 32 });
  g.center();
  return g;
}
function spring(turns = 4.5, r = 0.42, h = 1.5, tube = 0.1) {
  const pts: Vector3[] = [];
  const n = 120;
  for (let i = 0; i <= n; i++) { const t = i / n; const a = t * turns * Math.PI * 2; pts.push(new Vector3(Math.cos(a) * r, t * h - h / 2, Math.sin(a) * r)); }
  return new TubeGeometry(new CatmullRomCurve3(pts), 260, tube, 14, false);
}

const PARTS: { geo: () => BufferGeometry; color: number; size: number }[] = [
  { geo: () => new TorusKnotGeometry(0.52, 0.19, 200, 28), color: 2, size: 1.25 },
  { geo: () => gear(12), color: 0, size: 1.2 },
  { geo: () => hexNut(), color: 5, size: 1 },
  { geo: () => spring(), color: 3, size: 1.1 },
  { geo: () => new CapsuleGeometry(0.3, 0.8, 8, 28), color: 4, size: 1 },
  { geo: () => new RoundedBoxGeometry(0.9, 0.9, 0.9, 5, 0.16), color: 1, size: 1 },
  { geo: () => new TorusGeometry(0.5, 0.2, 28, 72), color: 5, size: 1 },
  { geo: () => new IcosahedronGeometry(0.58, 0), color: 2, size: 0.95 },
  { geo: () => gear(8, 0.52, 0.26), color: 4, size: 0.85 },
  { geo: () => new RoundedBoxGeometry(1.1, 0.42, 0.42, 4, 0.12), color: 0, size: 0.9 },
  { geo: () => hexNut(0.44, 0.3), color: 3, size: 0.8 },
  { geo: () => new TorusKnotGeometry(0.34, 0.12, 140, 20, 3, 2), color: 1, size: 0.9 },
  { geo: () => new CapsuleGeometry(0.22, 0.5, 6, 20), color: 2, size: 0.75 },
  { geo: () => new IcosahedronGeometry(0.4, 0), color: 5, size: 0.75 },
];

/* ---------- material patch ---------- */
function patch(mat: MeshPhysicalMaterial, glow: Color, minY: number, maxY: number, shared: { uLayers: { value: number } }) {
  const u = { uPrint: { value: 1 }, uMinY: { value: minY }, uMaxY: { value: maxY }, uGlow: { value: glow }, uLayers: shared.uLayers };
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vH;\nvarying float vWY;\nuniform float uMinY;\nuniform float uMaxY;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvH = (position.y - uMinY) / max(0.0001, uMaxY - uMinY);\nvWY = position.y;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vH;\nvarying float vWY;\nuniform float uPrint;\nuniform float uLayers;\nuniform vec3 uGlow;')
      .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nif (vH > uPrint + 0.0005) discard;')
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        float band = sin(vWY * 150.0);
        vec3 upV = normalize((viewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz);
        normal = normalize(normal + upV * band * 0.32 * uLayers);`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float edge = 1.0 - smoothstep(0.0, 0.03, uPrint - vH);
        totalEmissiveRadiance += uGlow * edge * step(uPrint, 0.999) * 3.0;
        diffuseColor.rgb *= 1.0 - uLayers * 0.12 * (0.5 + 0.5 * band);`);
  };
  mat.customProgramCacheKey = () => 'pl-part';
  return u;
}

export function createCluster(canvas: HTMLCanvasElement) {
  // phones: a 3× screen hides the jaggies, so skip MSAA and render at 1.5× — the fill rate is what drops frames
  const phone = matchMedia('(max-width: 767px)').matches;
  const renderer = new WebGLRenderer({ canvas, antialias: !phone || devicePixelRatio < 2, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, phone ? 1.5 : 1.75));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.75;
  pmrem.dispose();
  const camera = new PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 15);

  const key = new DirectionalLight('#ffffff', 1.6); key.position.set(3, 5, 6); scene.add(key);
  const tints = FILAMENT.filter((_, i) => i % 2 === 0).map((c, i) => { const l = new PointLight(c, 60, 16, 1.6); l.userData.phase = (i / 3) * Math.PI * 2; scene.add(l); return l; });

  const root = new Group(); scene.add(root);
  const shared = { uLayers: { value: 1 } };
  const parts = PARTS.map((p, i) => {
    const geo = p.geo();
    geo.computeBoundingBox();
    const bb = geo.boundingBox!;
    const color = new Color(FILAMENT[p.color]);
    const mat = new MeshPhysicalMaterial({
      color, metalness: 0.12, roughness: 0.34, clearcoat: 0.8, clearcoatRoughness: 0.2,
      sheen: 0.35, sheenColor: color.clone(), sheenRoughness: 0.4, side: DoubleSide,
      emissive: color.clone().multiplyScalar(0.08),
    });
    const u = patch(mat, color.clone().lerp(new Color('#ffffff'), 0.35), bb.min.y, bb.max.y, shared);
    const mesh = new Mesh(geo, mat);
    mesh.scale.setScalar(p.size);
    const r = Math.max(bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z) * 0.5 * p.size;
    // golden-angle spiral on an ellipsoid → even spread, no overlaps at rest
    const t = (i + 0.5) / PARTS.length;
    const phi = Math.acos(1 - 2 * t), theta = i * 2.39996;
    const home = new Vector3(Math.sin(phi) * Math.cos(theta) * 3.0, Math.cos(phi) * 2.1, Math.sin(phi) * Math.sin(theta) * 1.6);
    mesh.position.copy(home);
    mesh.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    root.add(mesh);
    return { mesh, mat, u, home, vel: new Vector3(), spin: new Vector3((Math.random() - 0.5) * 0.004, (Math.random() - 0.5) * 0.006, 0), r, phase: Math.random() * 6.28, delay: i / PARTS.length };
  });

  /* ---------- pointer ---------- */
  const ray = new Raycaster();
  const plane = new Plane(new Vector3(0, 0, 1), 0);
  const ndc = new Vector2(9, 9);
  const hit = new Vector3();
  let pointerOn = false, burst = 0;
  const burstAt = new Vector3();

  function pointer(x: number, y: number) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    pointerOn = true;
  }

  /* ---------- modes ---------- */
  let mode: Mode = 'silk';
  function setMode(m: Mode) {
    mode = m;
    for (const p of parts) {
      p.mat.wireframe = m === 'wire';
      p.mat.roughness = m === 'resin' ? 0.12 : 0.34;
      p.mat.metalness = m === 'resin' ? 0.02 : 0.12;
      p.mat.clearcoat = m === 'resin' ? 1 : 0.8;
      p.mat.sheen = m === 'resin' ? 0 : 0.35;
      p.mat.emissive.copy(p.mat.color).multiplyScalar(m === 'wire' ? 0.55 : 0.08);
    }
    shared.uLayers.value = m === 'silk' ? 1 : 0;
  }
  // print progress 0..1 across the whole cluster; each part prints in its own slice with overlap
  function setPrint(g: number) {
    for (const p of parts) {
      const local = (g - p.delay * 0.55) / 0.45;
      p.u.uPrint.value = Math.min(1, Math.max(0, local));
    }
  }

  /* ---------- sizing ---------- */
  let W = 1, H = 1;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    W = w; H = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // wide stage: cluster sits right of the headline; tall stage: above it
    const wide = w / h > 1.2;
    root.position.set(wide ? 3.1 * Math.min(1.25, w / h / 1.6) : 0, wide ? 0.05 : 1.25, 0);
    root.scale.setScalar(wide ? 1 : Math.min(1, (w / h) * 1.1 + 0.15));
  }
  resize();

  /* ---------- simulation ---------- */
  const tmp = new Vector3(), local = new Vector3();
  let time = 0, scrollK = 0;
  function step(dt: number) {
    time += dt;
    root.rotation.y = Math.sin(time * 0.12) * 0.25 + scrollK * 0.8;
    root.rotation.x = scrollK * 0.4;
    tints.forEach((l) => { const a = time * 0.35 + l.userData.phase; l.position.set(Math.cos(a) * 6 + root.position.x, Math.sin(a * 1.3) * 3, 3 + Math.sin(a) * 2); });

    if (pointerOn) { ray.setFromCamera(ndc, camera); ray.ray.intersectPlane(plane, hit); }
    for (const p of parts) {
      // spring to (bobbing) home
      tmp.copy(p.home); tmp.y += Math.sin(time * 0.7 + p.phase) * 0.18;
      p.vel.addScaledVector(tmp.sub(p.mesh.position), 0.012);
      if (pointerOn) {
        local.copy(hit); root.worldToLocal(local);
        tmp.copy(p.mesh.position).sub(local); tmp.z *= 0.4;
        const d = tmp.length(), R = 2.1;
        if (d < R) { p.vel.addScaledVector(tmp.normalize(), (R - d) * 0.045); p.spin.x += (R - d) * 0.0015; }
      }
      if (burst > 0) {
        tmp.copy(p.mesh.position).sub(burstAt);
        const d = Math.max(0.6, tmp.length());
        p.vel.addScaledVector(tmp.normalize(), (burst / d) * 0.5);
      }
    }
    burst = 0;
    // soft collisions
    for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) {
      const a = parts[i], b = parts[j];
      tmp.copy(a.mesh.position).sub(b.mesh.position);
      const d = tmp.length(), min = (a.r + b.r) * 0.82;
      if (d < min && d > 0.0001) { tmp.multiplyScalar(((min - d) / d) * 0.5 * 0.35); a.vel.add(tmp); b.vel.sub(tmp); }
    }
    for (const p of parts) {
      p.vel.multiplyScalar(0.9);
      p.mesh.position.add(p.vel);
      p.spin.multiplyScalar(0.985);
      p.mesh.rotation.x += 0.0025 + p.spin.x;
      p.mesh.rotation.y += 0.0035 + p.spin.y;
    }
  }

  function render() { renderer.render(scene, camera); }

  return {
    setMode, setPrint, resize, render, step,
    get mode() { return mode; },
    pointer, leave: () => { pointerOn = false; },
    burst: (x: number, y: number) => {
      pointer(x, y); ray.setFromCamera(ndc, camera); ray.ray.intersectPlane(plane, burstAt); root.worldToLocal(burstAt); burst = 1;
    },
    setScroll: (k: number) => { scrollK = k; },
    size: () => ({ W, H }),
  };
}
