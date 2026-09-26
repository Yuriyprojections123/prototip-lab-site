// QA reader for the gate: opens the built site in headless Chromium and reads getComputedStyle for every
// selector in assertions.json → clone-styles.json (the contract's javascript_tool step, done with Playwright).
// Selector keys: `[@<width>] [!focus] <route> <css selector>`; default viewport 1440×900.
// usage: node scripts/read-styles.mjs [assertions.json] [out.json]    env BASE (default http://127.0.0.1:4321)
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pw = require('playwright');

const BASE = process.env.BASE ?? 'http://127.0.0.1:4321';
const A = process.argv[2] ?? 'clone-workspace/prototiplab/03-design-spec/assertions.json';
const OUT = process.argv[3] ?? 'clone-workspace/prototiplab/06-qa/latest/clone-styles.json';
const assertions = JSON.parse(fs.readFileSync(A, 'utf8'));

const parse = (key) => {
  let rest = key.trim(), width = 1440, focus = false;
  const m = rest.match(/^@(\d+)\s+/); if (m) { width = Number(m[1]); rest = rest.slice(m[0].length); }
  if (rest.startsWith('!focus ')) { focus = true; rest = rest.slice(7); }
  const sp = rest.indexOf(' ');
  return { width, focus, route: rest.slice(0, sp), css: rest.slice(sp + 1) };
};

const groups = new Map();
for (const a of assertions) {
  const p = parse(a.selector);
  const g = `${p.width}|${p.route}`;
  if (!groups.has(g)) groups.set(g, { ...p, items: new Map() });
  const item = groups.get(g).items.get(a.selector) ?? { css: p.css, focus: p.focus, props: new Set() };
  item.props.add(a.prop);
  groups.get(g).items.set(a.selector, item);
}

const b = await pw.chromium.launch();
const result = {};
const missing = [];
for (const g of groups.values()) {
  const ctx = await b.newContext({ viewport: { width: g.width, height: g.width < 768 ? 844 : 900 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => sessionStorage.setItem('pl-seen', '1'));
  const pg = await ctx.newPage();
  await pg.goto(BASE + g.route, { waitUntil: 'load' });
  await pg.evaluate(() => document.fonts.ready);
  await pg.waitForTimeout(1200);
  for (const [key, it] of g.items) {
    const loc = pg.locator(it.css).first();
    if (!(await loc.count())) { missing.push(key); result[key] = {}; continue; }
    if (it.focus) { await pg.keyboard.press('Tab'); await loc.focus(); await pg.waitForTimeout(400); }
    result[key] = await loc.evaluate((el, props) => {
      const s = getComputedStyle(el);
      return Object.fromEntries(props.map((p) => [p, s[p]]));
    }, [...it.props]);
    if (it.focus) await pg.evaluate(() => document.activeElement?.blur());
  }
  await ctx.close();
}
await b.close();
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(result, null, 1));
console.log(`read ${Object.keys(result).length} selectors across ${groups.size} page×viewport groups → ${OUT}`);
if (missing.length) console.log('selectors not found:', missing);
