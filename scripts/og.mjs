// Open Graph card = the real home hero at 1200×630 in static-render mode (the pre-rendered 3D still, no WebGL needed).
// usage: node scripts/og.mjs   (needs the built site served at BASE, default http://127.0.0.1:4321)
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pw = require('playwright');
const BASE = process.env.BASE ?? 'http://127.0.0.1:4321';
const b = await pw.chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1200, height: 630 }, reducedMotion: 'reduce', deviceScaleFactor: 1 });
await ctx.addInitScript(() => sessionStorage.setItem('pl-seen', '1'));
const pg = await ctx.newPage();
await pg.goto(BASE + '/', { waitUntil: 'load' });
await pg.evaluate(() => document.fonts.ready);
await pg.addStyleTag({ content: `
  .site-header__nav, .hero__states, .hero__readout, .filament { display: none !important; }
  .hero__stage { height: 540px !important; min-height: 0 !important; }
  .hero__title { bottom: 40px !important; font-size: 84px !important; }
` });
await pg.waitForTimeout(500);
await pg.screenshot({ path: 'public/og.png', clip: { x: 0, y: 0, width: 1200, height: 630 } });
await b.close();
console.log('public/og.png written');
