// Procedural three.js scene for «Образец». One continuous parameter drives every material state:
//   0 — nothing (sketch lives in SVG)   1 — wireframe   1→2 — printing (layer clip rises, nozzle ring rides the cut)
//   2 — raw print (layer banding)       3 — primer (matte grey, layers sanded away)      4 — paint (graphite satin + amber inlay)
import {
  ACESFilmicToneMapping, CylinderGeometry, DirectionalLight, DoubleSide, EdgesGeometry, Group, LatheGeometry,
  LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial,
  PerspectiveCamera, PMREMGenerator, SRGBColorSpace, Scene, TorusGeometry, Vector2, WebGLRenderer, Color,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { HEIGHT, INLAY_Y, profilePoints, radiusAt } from './profile';

const FILAMENT = new Color('#d8d3c7');
const PRIMER = new Color('#8e8c86');
const PAINT = new Color('#1d1d1b');
const AMBER = new Color('#ff5a1f');

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export type Sample = ReturnType<typeof createSample>;

export function createSample(canvas: HTMLCanvasElement, opts: { dpr?: number } = {}) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, opts.dpr ?? 1.75));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const camera = new PerspectiveCamera(28, 1, 0.1, 100);
  const target = { x: 0, y: 1.12, z: 0 };

  // workshop light: warm key from upper-left, cool fill, rim from behind
  const key = new DirectionalLight(0xfff1e2, 2.4); key.position.set(-3.5, 5.5, 4); scene.add(key);
  const fill = new DirectionalLight(0xe6ecef, 0.7); fill.position.set(4, 2, 3); scene.add(fill);
  const rim = new DirectionalLight(0xffffff, 1.6); rim.position.set(0.5, 3.5, -5); scene.add(rim);

  const root = new Group(); scene.add(root);
  const spin = new Group(); root.add(spin);

  // body
  const pts = profilePoints(8).map(([r, y]) => new Vector2(r, y));
  const bodyGeo = new LatheGeometry(pts, 120);
  bodyGeo.computeVertexNormals();
  const uniforms = { uClip: { value: HEIGHT + 1 }, uBand: { value: 0 }, uEdge: { value: 0 }, uFreq: { value: 62 } };
  const bodyMat = new MeshPhysicalMaterial({ color: PAINT.clone(), roughness: 0.4, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.25, side: DoubleSide });
  bodyMat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vY;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvY = position.y;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vY;\nuniform float uClip;\nuniform float uBand;\nuniform float uEdge;\nuniform float uFreq;')
      .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nif (vY > uClip) discard;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        float layer = fract(vY * uFreq);
        float groove = smoothstep(0.0, 0.18, layer) * smoothstep(1.0, 0.82, layer);
        diffuseColor.rgb *= 1.0 - uBand * 0.34 * (1.0 - groove);
        float hot = smoothstep(uClip - 0.035, uClip, vY) * uEdge;
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0, 0.36, 0.12), hot);`);
  };
  const body = new Mesh(bodyGeo, bodyMat);
  spin.add(body);

  // wireframe — quad grid only (EdgesGeometry drops coplanar quad diagonals)
  const wireGeo = new EdgesGeometry(new LatheGeometry(profilePoints(3).map(([r, y]) => new Vector2(r * 1.002, y)), 36), 1);
  const wireMat = new LineBasicMaterial({ color: 0x141413, transparent: true, opacity: 0, depthWrite: false });
  wireMat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, { uClip: uniforms.uClip });
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vY;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvY = position.y;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vY;\nuniform float uClip;')
      .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nif (vY < uClip) discard;');
  };
  const wire = new LineSegments(wireGeo, wireMat);
  spin.add(wire);

  // nozzle ring riding the print cut
  const nozzle = new Mesh(new TorusGeometry(1, 0.012, 8, 96), new MeshBasicMaterial({ color: AMBER, transparent: true }));
  nozzle.rotation.x = Math.PI / 2;
  root.add(nozzle);

  // amber inlay ring (painted state)
  const inlayR = radiusAt(INLAY_Y, profilePoints(8));
  const inlay = new Mesh(new TorusGeometry(inlayR + 0.004, 0.02, 12, 120), new MeshStandardMaterial({ color: AMBER, emissive: AMBER, emissiveIntensity: 0.25, roughness: 0.35 }));
  inlay.rotation.x = Math.PI / 2; inlay.position.y = INLAY_Y;
  spin.add(inlay);

  // turntable plate
  const plate = new Mesh(new CylinderGeometry(1.4, 1.4, 0.07, 96), new MeshStandardMaterial({ color: 0x232321, roughness: 0.55, metalness: 0.1 }));
  plate.position.y = -0.036;
  root.add(plate);
  const plateEdge = new LineSegments(new EdgesGeometry(new CylinderGeometry(1.4, 1.4, 0.07, 96), 30), new LineBasicMaterial({ color: 0x5c5b57 }));
  plateEdge.position.y = -0.036;
  root.add(plateEdge);

  const profile = profilePoints(8);
  let stage = 4;

  function setStage(s: number) {
    stage = s;
    const wireIn = clamp01(s);
    const printT = easeInOut(clamp01(s - 1));
    const toPrimer = clamp01(s - 2);
    const toPaint = clamp01(s - 3);
    const clip = s < 1 ? -1 : s < 2 ? lerp(0, HEIGHT, printT) : HEIGHT + 1;
    uniforms.uClip.value = clip;
    uniforms.uBand.value = s < 2 ? 1 : 1 - toPrimer;
    uniforms.uEdge.value = s > 1 && s < 2 ? 1 : 0;
    wireMat.opacity = s <= 1 ? wireIn * 0.6 : s < 2 ? 0.35 : 0;
    wire.visible = wireMat.opacity > 0.001;
    body.visible = s > 1;
    const c = s < 2 ? FILAMENT.clone() : s < 3 ? FILAMENT.clone().lerp(PRIMER, toPrimer) : PRIMER.clone().lerp(PAINT, toPaint);
    bodyMat.color.copy(c);
    bodyMat.roughness = s < 3 ? lerp(0.55, 0.92, toPrimer) : lerp(0.92, 0.36, toPaint);
    bodyMat.metalness = s < 3 ? 0 : lerp(0, 0.18, toPaint);
    bodyMat.clearcoat = s < 3 ? 0 : toPaint;
    nozzle.visible = s > 1 && s < 2;
    if (nozzle.visible) { nozzle.position.y = clip; const r = radiusAt(Math.max(0.001, clip), profile) + 0.05; nozzle.scale.set(r, r, 1); }
    const inlayT = clamp01((s - 3.35) / 0.65);
    inlay.visible = inlayT > 0;
    inlay.scale.setScalar(0.98 + inlayT * 0.02);
    (inlay.material as MeshStandardMaterial).opacity = inlayT;
    (inlay.material as MeshStandardMaterial).transparent = inlayT < 1;
  }

  /** Layer number for the mono counter while printing. */
  function layerInfo(total = 412) {
    const t = clamp01(stage - 1);
    return { layer: Math.round(easeInOut(t) * total), total, printing: stage > 1 && stage < 2 };
  }

  let w = 0, h = 0;
  function resize() {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height || (r.width === w && r.height === h)) return;
    w = r.width; h = r.height;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const dist = 7.6 * Math.max(1, 0.95 / camera.aspect);
    camera.position.set(0, target.y + dist * 0.3, dist);
    camera.lookAt(target.x, target.y, target.z);
    camera.updateProjectionMatrix();
  }

  function render() { resize(); renderer.render(scene, camera); }

  function dispose() {
    renderer.dispose(); pmrem.dispose();
    scene.traverse((o: any) => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
  }

  setStage(4);
  return { renderer, scene, camera, root, spin, setStage, get stage() { return stage; }, layerInfo, render, resize, dispose };
}
