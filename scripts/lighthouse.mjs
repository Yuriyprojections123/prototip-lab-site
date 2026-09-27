// Lighthouse, mobile + desktop, against the built site served locally.
// usage: CHROME_PATH=/path/to/chrome node scripts/lighthouse.mjs [route ...]   env BASE (default http://127.0.0.1:4321)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const BASE = process.env.BASE ?? 'http://127.0.0.1:4321';
const OUT = 'clone-workspace/prototiplab/07-lighthouse';
const routes = process.argv.slice(2).length ? process.argv.slice(2) : ['/', '/raschet/', '/uslugi/skanirovanie/', '/portfolio/'];
fs.mkdirSync(OUT, { recursive: true });
const rows = [];
for (const r of routes) {
  const slug = r === '/' ? 'home' : r.replace(/^\/|\/$/g, '').replace(/\//g, '-');
  for (const ff of ['mobile', 'desktop']) {
    const out = `${OUT}/${slug}-${ff}.json`;
    const args = ['-y', 'lighthouse@13', BASE + r, '--quiet', '--output=json', `--output-path=${out}`, '--chrome-flags=--headless=new --no-sandbox'];
    if (ff === 'desktop') args.push('--preset=desktop');
    try { execFileSync('npx', args, { stdio: 'ignore', timeout: 240000 }); } catch { rows.push(`${slug} ${ff}: lighthouse failed`); continue; }
    const j = JSON.parse(fs.readFileSync(out, 'utf8'));
    const c = j.categories, a = j.audits;
    const s = (k) => Math.round(c[k].score * 100);
    rows.push(`| ${r} | ${ff} | ${s('performance')} | ${s('accessibility')} | ${s('best-practices')} | ${s('seo')} | ${a['largest-contentful-paint'].displayValue} | ${a['total-blocking-time'].displayValue} | ${a['cumulative-layout-shift'].displayValue} |`);
    console.log(rows.at(-1));
  }
}
fs.writeFileSync(`${OUT}/summary.md`, '| Route | Form factor | Perf | A11y | Best pr. | SEO | LCP | TBT | CLS |\n|---|---|---|---|---|---|---|---|---|\n' + rows.join('\n') + '\n');
