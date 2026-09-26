// Open Graph card = the real home hero at 1200×630 in static-render mode (no WebGL needed).
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
  .site-header__nav, .site-header__tg, .hero__actions .hero__tg, .hero__lead, .hero__states, .hero__hint { display: none !important; }
  .hero { min-height: 630px !important; padding-top: 96px !important; padding-bottom: 40px !important; }
  .hero__stage { grid-column: 8 / span 5 !important; }
` });
await pg.waitForTimeout(500);
await pg.screenshot({ path: 'public/og.png', clip: { x: 0, y: 0, width: 1200, height: 630 } });
await b.close();
console.log('public/og.png written');
