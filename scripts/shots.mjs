// Visual-reference screenshots of the built site (not a gate input).
// usage: node scripts/shots.mjs <outDir> [route ...]   env BASE (default http://127.0.0.1:4321)
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pw = require('playwright');
const BASE = process.env.BASE ?? 'http://127.0.0.1:4321';
const [out = 'shots', ...routes] = process.argv.slice(2);
const list = routes.length ? routes : ['/'];
fs.mkdirSync(out, { recursive: true });
const b = await pw.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [];
for (const [vk, vp] of Object.entries({ desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } })) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 1, isMobile: vk === 'mobile', hasTouch: vk === 'mobile' });
  await ctx.addInitScript(() => sessionStorage.setItem('pl-seen', '1'));
  const pg = await ctx.newPage();
  pg.on('console', (m) => { if (m.type() === 'error') errors.push(`${vk} ${pg.url()} ${m.text()}`); });
  pg.on('pageerror', (e) => errors.push(`${vk} ${pg.url()} ${e.message}`));
  for (const r of list) {
    await pg.goto(BASE + r, { waitUntil: 'load' });
    await pg.waitForTimeout(1500);
    // scroll through so reveals and lazy images fire
    const H = await pg.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += vp.height * 0.6) { await pg.evaluate((y) => window.scrollTo(0, y), y); await pg.waitForTimeout(120); }
    await pg.evaluate(() => { window.scrollTo(0, 0); document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-in')); });
    await pg.waitForTimeout(1600);
    const slug = r === '/' ? 'home' : r.replace(/^\/|\/$/g, '').replace(/\//g, '-');
    await pg.screenshot({ path: `${out}/${slug}--${vk}-top.png` });
    if (process.env.FRAMES) {
      // viewport frames down the page (fullPage stitching breaks around sticky chapters)
      const total = await pg.evaluate(() => document.documentElement.scrollHeight);
      let i = 0;
      for (let y = 0; y < total - 10; y += vp.height) {
        await pg.evaluate((y) => { (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : window.scrollTo(0, y)); }, y);
        await pg.waitForTimeout(700);
        await pg.screenshot({ path: `${out}/${slug}--${vk}-f${String(i++).padStart(2, '0')}.png` });
      }
    }
  }
  await ctx.close();
}
await b.close();
fs.writeFileSync(`${out}/console-errors.txt`, errors.join('\n'));
console.log('shots done; console errors:', errors.length);
for (const e of errors.slice(0, 20)) console.log(' ', e);
