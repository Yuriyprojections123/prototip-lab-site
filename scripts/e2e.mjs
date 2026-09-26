// Interaction coverage: drives every stateful component on the built site and checks the revealed state.
// usage: node scripts/e2e.mjs     env BASE (default http://127.0.0.1:4321)
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pw = require('playwright');
const BASE = process.env.BASE ?? 'http://127.0.0.1:4321';
const results = [];
const ok = (name, pass, detail = '') => { results.push({ name, pass, detail }); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`); };

const b = await pw.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const mk = async (opts = {}) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  await ctx.addInitScript(() => sessionStorage.setItem('pl-seen', '1'));
  const pg = await ctx.newPage();
  const external = [];
  pg.on('request', (r) => { const u = new URL(r.url()); if (!['127.0.0.1', 'localhost'].includes(u.hostname) && !u.protocol.startsWith('data') && !u.protocol.startsWith('blob')) external.push(r.url()); });
  const errors = [];
  pg.on('pageerror', (e) => errors.push(e.message));
  return { ctx, pg, external, errors };
};

// 1. home: hero states, compare slider, no external requests, no errors
{
  const { ctx, pg, external, errors } = await mk();
  await pg.goto(BASE + '/?3d=1', { waitUntil: 'load' });
  await pg.waitForTimeout(2500);
  const live = await pg.locator('[data-hero-object]').getAttribute('class');
  ok('hero 3D initialises (or static fallback)', /is-live|is-static/.test(live ?? ''), live ?? '');
  await pg.click('.hero-state[data-state="0"]');
  await pg.waitForTimeout(300);
  ok('hero state button toggles aria-pressed', (await pg.getAttribute('.hero-state[data-state="0"]', 'aria-pressed')) === 'true');
  await pg.click('.hero-state[data-state="1"]');
  await pg.waitForTimeout(1500);
  const readout = await pg.textContent('[data-layer]');
  ok('print state shows layer counter', /Слой \d{3} \/ 412/.test(readout ?? ''), readout ?? '');
  await pg.locator('[data-compare]').scrollIntoViewIfNeeded();
  await pg.waitForSelector('[data-compare].is-ready', { state: 'attached', timeout: 8000 }).catch(async () => { await pg.mouse.wheel(0, 200); await pg.waitForSelector('[data-compare].is-ready', { state: 'attached', timeout: 8000 }); });
  await pg.waitForTimeout(400);
  const h = pg.locator('[data-handle]');
  await h.focus();
  await pg.keyboard.press('ArrowRight'); await pg.keyboard.press('ArrowRight');
  // redraw runs on the next animation frame — slow under software GL, so wait for it rather than a fixed delay
  await pg.waitForFunction(() => document.querySelector('[data-handle]')?.getAttribute('aria-valuenow') === '54', null, { timeout: 4000 }).catch(() => {});
  ok('compare slider responds to keyboard', (await h.getAttribute('aria-valuenow')) === '54', await h.getAttribute('aria-valuenow'));
  await pg.click('[data-col="sla"]');
  ok('compare table toggle', (await pg.getAttribute('.compare__table table', 'data-show')) === 'sla');
  // process chapter scrub
  const proc = pg.locator('[data-process]');
  const isLive = /is-live/.test((await proc.getAttribute('class')) ?? '');
  if (isLive) {
    const box = await proc.boundingBox();
    await pg.evaluate((y) => window.scrollTo(0, y), (await pg.evaluate(() => scrollY)) + box.y + box.height * 0.5);
    await pg.waitForTimeout(800);
    ok('process scroll activates a middle step', (await pg.locator('.process__step.is-active').getAttribute('data-step')) === '2' || (await pg.locator('.process__step.is-active').getAttribute('data-step')) === '3', await pg.locator('.process__step.is-active').getAttribute('data-step'));
  } else ok('process scroll (list mode)', true, 'not live in this browser');
  ok('home makes no external requests', external.length === 0, external.slice(0, 3).join(' '));
  ok('home has no JS errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// 2. mobile menu
{
  const { ctx, pg } = await mk({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await pg.goto(BASE + '/uslugi/', { waitUntil: 'load' });
  await pg.click('[data-menu-open]');
  ok('mobile menu opens', await pg.isVisible('[data-menu]'));
  ok('menu moves focus to close button', await pg.evaluate(() => document.activeElement?.hasAttribute('data-menu-close')));
  await pg.keyboard.press('Escape');
  ok('Esc closes menu and returns focus', !(await pg.isVisible('[data-menu]')) && await pg.evaluate(() => document.activeElement?.hasAttribute('data-menu-open')));
  const overflow = await pg.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  ok('no horizontal overflow at 390px (/uslugi/)', !overflow);
  await ctx.close();
}

// 3. portfolio filter
{
  const { ctx, pg } = await mk();
  await pg.goto(BASE + '/portfolio/', { waitUntil: 'load' });
  await pg.click('[data-filter="kosplej"]');
  await pg.waitForTimeout(300);
  const visible = await pg.locator('.pf__item:not([hidden])').count();
  ok('filter shows only cosplay items', visible === 2, `${visible} visible`);
  ok('filter syncs ?cat=', pg.url().includes('cat=kosplej'));
  ok('count updates', (await pg.textContent('[data-count]')) === '02');
  await pg.goto(BASE + '/portfolio/?cat=revers', { waitUntil: 'load' });
  await pg.waitForTimeout(300);
  ok('?cat= restores filter on load', (await pg.getAttribute('[data-filter="revers"]', 'aria-pressed')) === 'true');
  await ctx.close();
}

// 4. quote flow: validation, steps, summary, offline success
{
  const { ctx, pg, errors } = await mk({ permissions: ['clipboard-read', 'clipboard-write'] });
  await pg.goto(BASE + '/raschet/?task=merch', { waitUntil: 'load' });
  await pg.waitForTimeout(500);
  ok('?task= preselects the task', await pg.isChecked('input[name="task"][value="merch"]'));
  await pg.click('input[name="task"][value="figurine"]', { force: true });
  ok('summary reflects task', (await pg.textContent('[data-sum="task"]')) === 'Фигурка');
  await pg.click('[data-next]'); await pg.waitForTimeout(700);
  await pg.click('[data-preset="35"]');
  ok('size preset updates output', (await pg.textContent('[data-size-out]')) === '35 см');
  await pg.click('[data-next]'); await pg.waitForTimeout(700);
  await pg.click('[data-next]'); await pg.waitForTimeout(700); // no quantity chosen → error
  ok('quantity required shows error', await pg.isVisible('[data-err="quantity"]'));
  ok('invalid group gets aria-invalid', (await pg.getAttribute('.q-step.is-cur [role="radiogroup"]', 'aria-invalid')) === 'true');
  await pg.click('input[name="quantity"][value="1"]', { force: true });
  ok('error clears after choosing', !(await pg.isVisible('[data-err="quantity"]')));
  await pg.click('[data-next]'); await pg.waitForTimeout(700);
  await pg.click('input[name="deadline"][value="2-4w"]', { force: true });
  await pg.click('[data-next]'); await pg.waitForTimeout(700);
  await pg.click('[data-next]'); await pg.waitForTimeout(700);
  ok('description required', await pg.isVisible('[data-err="description"]'));
  await pg.fill('#q-desc', 'Фигурка по фотографии, 35 см, покраска');
  await pg.setInputFiles('[data-files]', { name: 'ref.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64') });
  ok('file listed with remove button', (await pg.locator('.q-files li').count()) === 1);
  ok('summary counts files', (await pg.textContent('[data-sum="files"]')) === '1 шт');
  await pg.click('[data-next]'); await pg.waitForTimeout(700);
  await pg.fill('#q-name', 'Анна');
  await pg.fill('#q-contact', 'не контакт');
  await pg.click('[data-submit]');
  ok('bad contact rejected', await pg.isVisible('[data-err="contact"]'));
  ok('consent required', await pg.isVisible('[data-err="consent"]'));
  await pg.fill('#q-contact', '@anna_k_test');
  await pg.check('input[name="consent"]');
  await pg.click('[data-submit]');
  await pg.waitForTimeout(600);
  ok('no endpoint → offline result, nothing sent', await pg.isVisible('[data-state="offline"]'));
  const clip = await pg.evaluate(() => navigator.clipboard.readText().catch(() => ''));
  ok('brief copied to clipboard', clip.includes('Задача: Фигурка') && clip.includes('Размер: 35 см'), clip.split('\n').slice(0, 3).join(' / '));
  ok('quote page has no JS errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// 5. quote with endpoint: success + error states (endpoint injected at runtime; the build ships none)
{
  for (const status of [200, 500]) {
    const { ctx, pg } = await mk();
    let body = '';
    await pg.route('**/test-endpoint', async (r) => { body = r.request().postData() ?? ''; await r.fulfill({ status, body: '{}' }); });
    await pg.goto(BASE + '/raschet/', { waitUntil: 'domcontentloaded' });
    await pg.evaluate(() => { document.querySelector('[data-quote]').dataset.endpoint = '/test-endpoint'; });
    // re-init not needed: endpoint read at init → reload with attribute patched before scripts run
    await pg.addInitScript(() => { document.addEventListener('DOMContentLoaded', () => { const q = document.querySelector('[data-quote]'); if (q) q.dataset.endpoint = '/test-endpoint'; }); });
    await pg.reload({ waitUntil: 'load' });
    await pg.waitForTimeout(400);
    await pg.click('input[name="task"][value="reverse"]', { force: true }); await pg.click('[data-next]'); await pg.waitForTimeout(700);
    await pg.click('[data-next]'); await pg.waitForTimeout(700);
    await pg.click('input[name="quantity"][value="2-10"]', { force: true }); await pg.click('[data-next]'); await pg.waitForTimeout(700);
    await pg.click('input[name="deadline"][value="urgent"]', { force: true }); await pg.click('[data-next]'); await pg.waitForTimeout(700);
    await pg.fill('#q-desc', 'Сломанная деталь насоса, нужен реверс'); await pg.click('[data-next]'); await pg.waitForTimeout(700);
    await pg.fill('#q-name', 'Дмитрий'); await pg.fill('#q-contact', '+7 999 123-45-67'); await pg.check('input[name="consent"]');
    await pg.click('[data-submit]');
    await pg.waitForTimeout(800);
    const state = status === 200 ? 'success' : 'error';
    ok(`endpoint ${status} → ${state} state`, await pg.isVisible(`[data-state="${state}"]`));
    if (status === 200) ok('payload is multipart with brief + consent', body.includes('name="brief"') && body.includes('name="consent"') && body.includes('name="task"'));
    await ctx.close();
  }
}

// 6. reduced motion → static hero fallback, no three.js download
{
  const { ctx, pg } = await mk({ reducedMotion: 'reduce' });
  const got3 = [];
  pg.on('request', (r) => { if (/cluster\.|three/.test(r.url())) got3.push(r.url()); });
  await pg.goto(BASE + '/', { waitUntil: 'load' });
  await pg.waitForTimeout(1500);
  ok('reduced motion → static hero', /is-static/.test((await pg.locator('[data-hero-object]').getAttribute('class')) ?? ''));
  ok('reduced motion → three.js not downloaded', got3.length === 0);
  await ctx.close();
}

// 7. legacy URL
{
  const { ctx, pg } = await mk();
  await pg.goto(BASE + '/case-helmet.html', { waitUntil: 'load' });
  await pg.waitForTimeout(800);
  ok('old case URL forwards to new route', pg.url().endsWith('/portfolio/shlem-po-skanu/'), pg.url());
  await ctx.close();
}

await b.close();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} interaction checks passed`);
process.exit(failed.length ? 1 : 0);
