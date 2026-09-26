// Machine checks for clone-workspace/prototiplab/banned.md.
// 1) source/dist grep  2) computed-style scan of every built page (served at BASE, default http://127.0.0.1:4321)
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pw = require('playwright');
const BASE = process.env.BASE ?? 'http://127.0.0.1:4321';
const problems = [];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));

// --- 1. grep
const src = walk('src').filter((f) => /\.(astro|ts|css)$/.test(f));
const dist = walk('dist').filter((f) => /\.(html|css|js)$/.test(f));
const grep = (files, re, rule) => { for (const f of files) { const t = fs.readFileSync(f, 'utf8'); const m = t.match(re); if (m) problems.push(`${rule}: ${f} → ${m[0].slice(0, 60)}`); } };
grep(src, /\p{Emoji_Presentation}/u, "#5 emoji");
grep(src, /[✎◉▦◈⊞⌖✓✔]/u, '#5 unicode pseudo-icon');
grep(src, /lucide|heroicons|fontawesome|font-awesome/i, '#5 icon pack');
grep(src, /lorem ipsum/i, '#13 lorem');
grep(src, /backdrop-filter:\s*(?!none)[a-z]/i, '#2 glassmorphism');
grep(src, /radial-gradient/i, '#3 glow blob');
grep(src, /\bInter\b|Manrope|Unbounded|Aeonik/, '#4 generic or reference font');
grep(dist.filter((f) => f.endsWith('.html') || f.endsWith('.css')), /fonts\.googleapis|fonts\.gstatic|cdnjs|unpkg\.com|jsdelivr/i, '#12 external CDN');
grep(src, /79000000000|prototip-lab\.ru|1000\+|5\+ лет|50 мкм/, '#6 unverified fact');
grep(src, /мандалор|mandalor|star wars|звёздн[а-я]+ войн/i, '#11 franchise');
grep(src, /#6D4DFF|#8A63FF|#5A3BEC/i, '#1 old violet');
grep(src, /#0016EC/i, '#14 reference colour');

// --- 2. computed styles
const pages = ['/', '/uslugi/', ...fs.readdirSync('dist/uslugi', { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => `/uslugi/${d.name}/`),
  '/portfolio/', ...fs.readdirSync('dist/portfolio', { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => `/portfolio/${d.name}/`),
  '/studiya/', '/kontakty/', '/raschet/', '/politika-konfidencialnosti/', '/404.html'];
const b = await pw.chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => sessionStorage.setItem('pl-seen', '1'));
const pg = await ctx.newPage();
for (const r of pages) {
  await pg.goto(BASE + r, { waitUntil: 'load' });
  await pg.waitForTimeout(300);
  const found = await pg.evaluate(() => {
    const out = [];
    const hue = (c) => {
      const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/); if (!m) return null;
      const [r, g, b] = [m[1], m[2], m[3]].map((x) => x / 255); const a = m[4] === undefined ? 1 : +m[4];
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (!d || a < 0.05) return null;
      const l = (mx + mn) / 2, s = d / (1 - Math.abs(2 * l - 1));
      let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + 360) % 360;
      return { h, s };
    };
    const fonts = new Set();
    for (const el of document.querySelectorAll('body *')) {
      if (el.closest('svg')) continue;
      const s = getComputedStyle(el);
      for (const p of ['color', 'backgroundColor', 'borderTopColor']) {
        const x = hue(s[p]); if (x && x.h >= 245 && x.h <= 290 && x.s > 0.5) out.push(`#1 violet ${p} ${s[p]} on ${el.tagName}.${el.className}`);
      }
      if (s.backdropFilter !== 'none') out.push(`#2 backdrop-filter on ${el.tagName}.${el.className}`);
      if (/radial-gradient/.test(s.backgroundImage)) out.push(`#3 radial-gradient on ${el.tagName}.${el.className}`);
      // shadows: rings (0 blur) and insets only — no soft drop shadows or glows
      if (s.boxShadow !== 'none') for (const sh of s.boxShadow.split(/,(?![^(]*\))/)) {
        const lens = sh.replace(/rgba?\([^)]*\)/, '').match(/-?[\d.]+px/g) ?? [];
        if (!/inset/.test(sh) && parseFloat(lens[2] ?? '0') > 0) out.push(`#3 blurred shadow on ${el.tagName}.${el.className}: ${sh.trim()}`);
      }
      // v2 #7: no boxy controls — visible buttons, pills and chips are rounded
      if (el.matches('button, .btn, .chip, .filter-chip')) {
        const r = el.getBoundingClientRect();
        const surface = s.backgroundColor !== 'rgba(0, 0, 0, 0)' || s.boxShadow !== 'none' || parseFloat(s.borderTopWidth) > 0;
        if (r.width && r.height && surface && parseFloat(s.borderTopLeftRadius) + 0.5 < Math.min(r.height / 2, 12)) out.push(`#7 boxy control r=${s.borderTopLeftRadius} on ${el.tagName}.${el.className}`);
      }
      if (el.matches('.frame, .svc-card, .stmt__item, .blk__item, .plist__item, .ct__card, .q-form, .q-summary, .compare__view, .compare__table, .hero__stage, .process__step, .more__link, .case__pn-link, .pol__sec, .caps__item, .cta__card, .chapter--dark, .chapter--deep')) {
        const r = el.getBoundingClientRect();
        if (r.width > 120 && parseFloat(s.borderTopLeftRadius) < 12) out.push(`#7 boxy surface r=${s.borderTopLeftRadius} on ${el.tagName}.${el.className}`);
      }
      if (el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) fonts.add(s.fontFamily.split(',')[0].replace(/"/g, ''));
    }
    for (const f of fonts) if (!/Onest|JetBrains Mono/.test(f)) out.push(`#4 font ${f}`);
    return [...new Set(out)];
  });
  for (const f of found) problems.push(`${r}: ${f}`);
}
await b.close();
console.log(problems.length ? problems.join('\n') : 'banned.md: 0 violations');
console.log(`checked ${src.length} source files, ${dist.length} dist files, ${pages.length} pages`);
process.exit(problems.length ? 1 : 0);
