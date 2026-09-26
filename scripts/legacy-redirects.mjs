// Old *.html URLs → new routes. Writes public/_redirects (Netlify/Cloudflare-style) and a meta-refresh
// stub per old file so the redirect also works on plain static hosting. nginx rules are in README.
import fs from 'node:fs';

const map = {
  'index.html': '/',
  'services.html': '/uslugi/',
  'modeling.html': '/uslugi/modelirovanie/',
  'scanning.html': '/uslugi/skanirovanie/',
  'figurines.html': '/uslugi/figurki/',
  'merch.html': '/uslugi/merch/',
  'cosplay.html': '/uslugi/kosplej/',
  'portfolio.html': '/portfolio/',
  'case-award.html': '/portfolio/nagrady-it-konferencii/',
  'case-helmet.html': '/portfolio/shlem-po-skanu/',
  'case-part.html': '/portfolio/detal-snyataya-s-proizvodstva/',
  'about.html': '/studiya/',
  'contact.html': '/kontakty/',
};

const lines = Object.entries(map).map(([from, to]) => `/${from}  ${to}  301`);
fs.writeFileSync('public/_redirects', lines.join('\n') + '\n');

for (const [from, to] of Object.entries(map)) {
  if (from === 'index.html') continue; // would shadow the real home page
  const url = `https://prototiplab.ru${to}`;
  fs.writeFileSync(`public/${from}`, `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Страница переехала — ПРОТОТИП LAB</title><meta name="robots" content="noindex"><link rel="canonical" href="${url}"><meta http-equiv="refresh" content="0; url=${to}"></head><body><p>Страница переехала: <a href="${to}">${url}</a></p></body></html>\n`);
}
console.log('redirects:', Object.keys(map).length);
