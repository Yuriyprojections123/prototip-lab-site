// Kept apart from sample.ts so the check does not pull three.js into the page.
/**
 * Low-end / no-WebGL / software-rendered WebGL → the static render instead. Reduced motion and Save-Data do
 * not switch the scene off (phones with «remove animations» or a data-saving browser got a dead hero):
 * hero.ts skips the print replay under reduced motion instead.
 * `?3d=1` forces the 3D scene (QA in headless browsers, which rasterise WebGL in software).
 */
export function canRun3D(): boolean {
  if (new URLSearchParams(location.search).get('3d') === '1') return true;
  const nav = navigator as any;
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
