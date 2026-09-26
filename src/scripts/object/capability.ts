// Kept apart from sample.ts so the check does not pull three.js into the page.
/**
 * Low-end / no-WebGL / software-rendered WebGL / reduced motion / Save-Data → the static SVG render instead.
 * `?3d=1` forces the 3D scene (QA in headless browsers, which rasterise WebGL in software).
 */
export function canRun3D(): boolean {
  if (new URLSearchParams(location.search).get('3d') === '1') return true;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const nav = navigator as any;
  if (nav.connection?.saveData) return false;
  const lowCpu = (nav.hardwareConcurrency ?? 8) <= 4;
  const lowMem = (nav.deviceMemory ?? 8) <= 4;
  if (lowCpu && lowMem) return false;
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return false;
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    // CPU rasterisers: a continuous 3D loop would block the main thread
    if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)) return false;
    return true;
  } catch { return false; }
}
