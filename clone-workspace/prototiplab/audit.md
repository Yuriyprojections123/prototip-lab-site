# Stage 0 — Audit of prototiplab.ru (26.09.2026)

## How the audit was done

- The live site is a static build of this repository. All 14 live pages are byte-identical to `origin/main`
  (md5 checked page by page: index, services, modeling, scanning, figurines, merch, cosplay, portfolio,
  case-award, case-helmet, case-part, about, contact, 404).
- Chromium on the audit VPS cannot open `https://prototiplab.ru` (TLS handshake times out; curl works — the
  known TLS 1.3 blackhole on this IP). Computed styles were therefore read from a local copy of `origin/main`
  served over HTTP. Same bytes as production.
- Full text inventory: `01-recon/content-dump.md`. Computed-style tally per page: `01-recon/old-site-computed-tally.json`.
  Before-screenshots: `01-recon/screenshots/`.

## Route inventory

| Route | Role | Survives as |
|---|---|---|
| `/index.html` | home | `/` |
| `/services.html` | services overview (6 directions) | `/uslugi/` |
| `/modeling.html` | 3D modeling | `/uslugi/modelirovanie/` |
| `/scanning.html` | 3D scanning + reverse engineering | `/uslugi/skanirovanie/` |
| `/figurines.html` | figurines & collectibles | `/uslugi/figurki/` |
| `/merch.html` | corporate merch | `/uslugi/merch/` |
| `/cosplay.html` | cosplay & props | `/uslugi/kosplej/` |
| `services.html#prototyping` | prototyping (anchor only, no page) | `/uslugi/prototipirovanie/` (new page, built only from existing copy) |
| `/portfolio.html` | 3 cases + 6 uncaptioned gallery tiles | `/portfolio/` with category filter |
| `/case-award.html` | case: 120 awards | `/portfolio/nagrady-it-konferencii/` |
| `/case-helmet.html` | case: helmet fitted to head scan | `/portfolio/shlem-po-skanu/` |
| `/case-part.html` | case: discontinued part | `/portfolio/detal-snyataya-s-proizvodstva/` |
| `/about.html` | about the studio | `/studiya/` |
| `/contact.html` | contacts + brief form | `/kontakty/` + `/raschet/` (quote flow) |
| `/404.html` | not found | `/404.html` |
| — | privacy policy (missing; the form collects personal data without one) | `/politika-konfidencialnosti/` (new) |

Old `.html` URLs must keep working → redirect map in `public/_redirects` + nginx snippet in the README.

## What makes the current design generic (measured)

Each of these becomes a banned pattern (`banned.md`).

| Problem | Evidence |
|---|---|
| Violet SaaS accent `#6D4DFF` carries the whole identity | home: `rgb(109,77,255)` on 26 text nodes, CTA bg, focus, logo cube face, 404 gradient numerals |
| Violet radial "glow blobs" behind hero/404 | `radial-gradient(circle, rgba(109,77,255,.12), transparent 65%)` |
| Glassmorphism header | `backdrop-filter: blur(18px)` on `rgba(255,255,255,.86)` |
| Pill buttons with coloured glow shadow | `border-radius: 999px`, `box-shadow: rgba(109,77,255,.28) 0 8px 20px` |
| Uniform card grids | 6 service cards, 4 "why us" cards, 5 step cards, 4 tech cards, 3 testimonials — all 20–24px radius, same shadow |
| Stat block as proof | `1000+ / 5+ лет / 50 мкм` row under the hero, repeated on About |
| Centered eyebrow + H2 section heads everywhere | every section: tiny uppercase violet label, centred heading |
| Two-button hero next to a collage | `Рассчитать проект` + `Посмотреть работы` beside a generated collage |
| Pseudo-icons from Unicode glyphs | `✎ ◉ ▦ ◈ ⊞` on modeling, `TG / WA / @ / ⌖` badges on contacts |
| Unbounded display + Manrope body loaded from Google Fonts CDN | external `fonts.googleapis.com` — unreliable from RU networks, render-blocking |
| Motion = colour/translate hover only, 0.2–0.25s `ease` | tally: `0.25s ease` / `0.2s ease`; no scroll narrative, no object ever shown in 3D |
| Violet gradient CTA band before footer | `linear-gradient(135deg, #6D4DFF, #8A63FF …)` |
| Portfolio = the same 6 images reused under different captions | `figurine-sci-fi.webp` is used as "Аниме-персонаж", "Игровой герой" and "Шаржевая фигурка"; `helmet-hero.webp` as "Шлем" and "Маска"; `prototype.webp` as "Аксессуары" |

## Imagery

All 20 images in `assets/` (1200×900 WebP) are **AI-generated renders, not photographs of the studio's work**:
identical violet rim light and violet accents baked into every frame (the violet is the old site theme),
idealised studio interiors, generic people. They do not document real jobs. They are the only imagery the
studio has published, so they are reused **sparingly**, re-graded into the new palette (violet hue remapped,
see `assets/SOURCES.md`), always captioned honestly as illustrations, and the owner is asked for real photos
(`needs-confirmation.md` #1).

## Content that is strong and must survive

- The positioning line: **«Мы не печатаем файлы. Мы создаём изделия.»** — the best sentence on the site.
- «Большинство проектов начинается с фотографии, рисунка или слов» / «достаточно идеи, фотографии или эскиза» — lowers the barrier to asking.
- The 5-step process: Идея и бриф → Цифровая модель → Производство → Финиш и сборка → Готовое изделие (maps 1:1 to the required scroll sequence Идея → Модель → Печать → Постобработка → Готовое изделие).
- Scanning as the differentiator: «То, чего не делают обычные 3D-студии»; the chain Объект → Скан → Полигональная сетка → CAD-модель → Новая деталь.
- The three case studies with a real narrative (задача → модель → производство → финиш → результат). Strongest detail: the part case — «У клиента теперь есть чертёж, которого не было даже у производителя».
- Technology rationale: «Подбираем технологию не по привычке, а под функцию, поверхность, размер и бюджет».
- FDM = прочная печать, корпуса, мастер-модели, крупные объекты, инженерные пластики; SLA = миниатюры, лица, фактуры, высокая детализация.
- Service copy on every subpage (formats, typical tasks, steps) — kept, tightened.
- Audiences list: бизнес, стартапы, продуктовые дизайнеры, коллекционеры, косплей-мастера, ивент-агентства, маркетинг-команды, частные клиенты.
- Contacts: Telegram @prototiplab (verified link), Москва, «приём объектов на сканирование по записи».
- Mission quote: «Если идею можно описать — мы найдём способ её произвести».

## Placeholder / unverified data → `needs-confirmation.md`

- WhatsApp `wa.me/79000000000` / «+7 900 000-00-00» — placeholder number. **Removed** from the new site.
- Email `hello@prototip-lab.ru` — domain with a hyphen, while the site lives on `prototiplab.ru`. Neither verified. **Not shown** until confirmed; slot documented in `src/data/site.ts`.
- Stats `1000+ проектов`, `5+ лет`, `50 мкм`, `1 → 1000` — no source. **Removed** from layout; not used as design elements.
- Scanner accuracy «до 0,05 мм» (scanning, about, case-part) — equipment unnamed. Kept only inside the case narrative where it is a claim about that job, flagged.
- Testimonials (Анна К., Дмитрий С., Мария Л.) — no source, and Мария's quote says **200** awards while the case says **120**. **Removed**; the layout has no testimonial slot that would sit empty.
- «Промо-продукция тиражом от 10 до 1000 штук» — unverified range. Kept as owner-confirm item, not shown.
- Case facts (120 шт / 21 день, 5 недель, 2 недели, 0,1 мм разброс, 12 ракурсов) — they are the studio's own case copy; kept inside cases, listed for confirmation.

## Third-party characters and franchises

- Portfolio alt text on the home page calls the helmet «Шлем мандалорца» (Star Wars / Disney). The case copy says the
  client brought «скриншоты из игры». The image itself is a generic sci-fi helmet.
  → The case stays, renamed neutrally «Шлем со светом и подгонкой по скану головы», never used as hero or brand imagery,
  no franchise name anywhere.
- Figurines page mentions «персонажи аниме и игр» as a format — fine as a service description; no specific character is named or shown.
- Generated images for the new site contain no characters at all.
