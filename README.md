# ПРОТОТИП LAB — prototiplab.ru, редизайн 2026

Сайт студии 3D-моделирования, сканирования и производства в Москве. Статический сайт на Astro с живым
three.js-объектом, сценой процесса по прокрутке, сравнением FDM/SLA и пошаговым брифом «Рассчитать проект».

![Главная — после](docs/screenshots/after-home-desktop.jpg)

## Запуск

```bash
npm start            # одна команда: ставит зависимости и поднимает dev-сервер на http://127.0.0.1:4321
```

Продакшн-сборка:

```bash
npm install
npm run build        # → dist/ (17 статических страниц, sitemap, robots, редиректы старых адресов)
npm run preview      # проверить сборку на http://127.0.0.1:4321
```

`dist/` — обычная статика: её можно положить в любой веб-сервер. Node нужен только для сборки (≥ 22).

### Интеграции (переменные сборки, см. `.env.example`)

| Переменная | Что делает | По умолчанию |
|---|---|---|
| `PUBLIC_QUOTE_ENDPOINT` | URL, куда форма «Рассчитать проект» отправляет заявку (`POST`, `multipart/form-data`) | пусто — **форма ничего никуда не отправляет**: собирает бриф, копирует его и предлагает Telegram |
| `PUBLIC_YM_ID` | номер счётчика Яндекс Метрики; скрипт вставляется в `<head>` только если задан | пусто — Метрики нет |

Поля заявки: `task`, `size_cm`, `size_unknown`, `quantity`, `deadline`, `deadline_date`, `description`, `files[]`
(до 10 файлов по 25 МБ), `name`, `contact`, `consent` (=1, согласие по 152-ФЗ), `brief` (текст брифа целиком),
`page`, `company_site` (ловушка для ботов — если заполнено, заявку надо отбросить). Обработчик должен вернуть 2xx;
иначе посетитель видит состояние ошибки с тем же брифом, скопированным для Telegram. Цель Метрики: `quote_sent`.

Контакты, которые ждут подтверждения (почта, WhatsApp, адрес), заполняются в `src/data/site.ts` — после этого
появляются в подвале, на «Контактах» и в разметке LocalBusiness.

### Выкладка на nginx

Старые адреса (`/services.html`, `/case-helmet.html`…) в сборке уже переадресуются мета-редиректом и перечислены
в `dist/_redirects`. Для настоящих 301 на nginx:

```nginx
location = /services.html   { return 301 /uslugi/; }
location = /modeling.html   { return 301 /uslugi/modelirovanie/; }
location = /scanning.html   { return 301 /uslugi/skanirovanie/; }
location = /figurines.html  { return 301 /uslugi/figurki/; }
location = /merch.html      { return 301 /uslugi/merch/; }
location = /cosplay.html    { return 301 /uslugi/kosplej/; }
location = /portfolio.html  { return 301 /portfolio/; }
location = /case-award.html { return 301 /portfolio/nagrady-it-konferencii/; }
location = /case-helmet.html { return 301 /portfolio/shlem-po-skanu/; }
location = /case-part.html  { return 301 /portfolio/detal-snyataya-s-proizvodstva/; }
location = /about.html      { return 301 /studiya/; }
location = /contact.html    { return 301 /kontakty/; }
location = /index.html      { return 301 /; }
error_page 404 /404.html;
location /_astro/ { expires 1y; add_header Cache-Control "public, immutable"; }
```

Прежний сайт целиком лежит в `legacy/` (и в истории git) — откат = выложить `legacy/`.

## Страницы

| Маршрут | Было |
|---|---|
| `/` | `index.html` |
| `/uslugi/` и `/uslugi/{modelirovanie, skanirovanie, figurki, merch, kosplej, prototipirovanie}/` | `services.html`, `modeling.html`, `scanning.html`, `figurines.html`, `merch.html`, `cosplay.html`; прототипирование было якорем — теперь страница, собранная только из текстов старого сайта |
| `/portfolio/` + 3 кейса | `portfolio.html`, `case-*.html` |
| `/studiya/` | `about.html` |
| `/kontakty/` | `contact.html` |
| `/raschet/` | форма с `contact.html`, теперь шестишаговый бриф |
| `/politika-konfidencialnosti/` | не было |
| `/404.html` | `404.html` |

## Направление бренда — «Спектр» (v2, 27.09.2026)

Первая версия («Грунт и графит»: квадратные углы, один янтарный акцент) владельцу не подошла: «никаких коробочных
кнопок, сайт должен быть высокотехнологичным, цветным и дизайнерским — это 3D-печать». Вторая версия строится на
том, что знает каждый, кто печатал: **радужный шёлковый PLA**. Шесть цветов филамента — циан `#00C2FF`, синий
`#2F5BFF`, маджента `#FF2E8E`, оранжевый `#FF6A1A`, жёлтый `#FFC61A`, лайм `#B6F500` — по одному на каждую услугу;
вместе они образуют спектр. Основа — холодный светлый «туман» `#EDEFF4` и чернильный `#0B0C10` для сцен и текста.
Все контролы — пилюли, все поверхности — мягкие карточки со скруглением 20–32 px. Подробно:
[`brand.md`](clone-workspace/prototiplab/brand.md).

### Шрифты

| Роль | Шрифт | Почему |
|---|---|---|
| Заголовки и текст | **Onest** Variable (OFL) | чистый гротеск с родной кириллицей: на кегле 80–128 px и весе 350 даёт лёгкий «технологичный» заголовок, в 15–17 px читается как интерфейс |
| Метки и цифры | **JetBrains Mono** Variable (OFL) | моноширинные цифры счётчика слоёв и техкарт |

Оба собираются в бандл из npm (`@fontsource-variable/*`) и отдаются с того же домена — внешних CDN на сайте нет.

## Референс Awwwards

Награды проверены на awwwards.com 27.09.2026.

**Основной — [Lusion v3](https://lusion.co)** ([страница на Awwwards](https://www.awwwards.com/sites/lusion-v3)):
Site of the Day 2 окт. 2023, **Developer Award 8,41** — самый высокий балл разработки среди рассмотренных
(Zentry — SOTD 28 авг. 2024, dev 7,5; Aardvark Book Club — SOTD 30 авг. 2026; Messenger — SOTD 10 нояб. 2025).
Взята *система*: светлая основа и тёмная скруглённая «сцена» под шапкой с физическим 3D-кластером, огромный
лёгкий заголовок, пилюли с точкой, ряд «+»-крестиков между главами, толстая цветная трубка, которая рисуется
по прокрутке, скруглённые медиа-карточки. Для студии печати трубка стала **нитью филамента**, а кластер —
**напечатанными деталями, которые печатаются слой за слоем**.
Ни одного файла, шрифта (Aeonik), цвета (#0016EC), изображения, формы (крестовины героя) или строки кода с
Lusion не взято. Разбор: [`reference.md`](clone-workspace/prototiplab/reference.md).

## Происхождение токенов

Каждый токен в [`tokens.css`](src/styles/tokens.css) и [`DESIGN.md`](clone-workspace/prototiplab/03-design-spec/DESIGN.md)
помечен: `brand`, `reference` (система Lusion v3) или `derived`.

| Группа | Источник | Примеры |
|---|---|---|
| Цвета | brand | туман, чернила, 6 цветов филамента, спектр (контраст WCAG проверен) |
| Шрифты | brand | Onest, JetBrains Mono |
| Изображения | brand | 3D-кластер кодом, силуэт процесса кодом, фото студии с акцентом цвета услуги |
| Радиусы | reference | пилюли 999 px у всех контролов, карточки 2 vw (20–32 px), медиа 1,4 vw |
| Шкала шрифта | reference | лёгкий дисплей 350, трекинг −0,05 em, 92 px заголовок героя @1440 |
| Сцена, поля, ритм | reference | сцена-карточка под шапкой, отступ карточек 0,84 vw, поля 2,2 vw, секции 8,5 vw |
| Движение | reference | `cubic-bezier(0.16,1,0.3,1)` 1,1 с; нить по прокрутке; пилюля заливается спектром от точки |

## Интерактивный слой

- **3D-кластер в первом экране** — three.js, 14 процедурных деталей (шестерня, гайка, узел, пружина, капсула,
  кубик, тор, D20) в цветах филамента. При загрузке они **печатаются слой за слоем** со светящимся срезом и
  счётчиком «Слой 001 / 412»; видны FDM-слои (шейдер). Пилюли переключают «Каркас / Печать / Шёлк PLA / Смола SLA».
  Детали отталкиваются от курсора, сталкиваются друг с другом, клик разбрасывает их. На слабых устройствах, при
  `prefers-reduced-motion`, Save-Data и программном WebGL — заранее отрендеренный кадр той же сцены, three.js не
  загружается.
- **Нить филамента** — на каждой странице спектральная линия с «соплом» выдавливается по прокрутке и переходит с
  края на край на границах глав, уходя под карточки.
- **Процесс** — пять цветных карточек едут горизонтально, пока глава закреплена; силуэт объекта нарисован пятью
  способами: эскиз → каркас → печать → грунт → готово. На телефоне — сетка карточек.
- **Карточки услуг** заливаются цветом своей нити из точки, где курсор вошёл в карточку.
- **FDM vs SLA** — разрез поверхности: оранжевые валики 0,2 мм против циановой смолы 0,05 мм, пилюля-разделитель
  (мышь, касание, клавиатура), лупа ×3, таблица.
- **Портфолио** — липкая пилюля-фильтр с `?cat=` в адресе; страницы кейсов с оглавлением.
- **Бриф** — 6 шагов, живая панель «Ваш бриф», файлы, валидация на месте, согласие по 152-ФЗ, Telegram на каждом шаге.
- Переходы между страницами — нативные View Transitions; плавная прокрутка Lenis только для мыши.

Для проверки 3D в headless-браузере: `/?3d=1`.

## Изображения

Порядок: фото студии → код → генерация. Сгенерировано **0** изображений, расход OpenRouter **$0.00 из $0.70**.
Все 20 изображений старого сайта — сгенерированные рендеры, не фото работ; фиолетовый свет в них заменён на цвет
нити своей услуги (`npm run photos`), подписаны как иллюстрации. Кадр-заглушка первого экрана — рендер нашей же
three.js-сцены. Манифест: [`assets/SOURCES.md`](assets/SOURCES.md).

## До / после

| До | После |
|---|---|
| ![](docs/screenshots/before-home-desktop.jpg) | ![](docs/screenshots/after-home-desktop.jpg) |
| ![](docs/screenshots/before-contact-desktop.jpg) | ![](docs/screenshots/after-quote-desktop.jpg) |
| ![](docs/screenshots/before-home-mobile.jpg) | ![](docs/screenshots/after-home-mobile.jpg) ![](docs/screenshots/after-quote-mobile.jpg) |

Процесс по прокрутке и сравнение технологий:

![](docs/screenshots/after-process-print-desktop.jpg)
![](docs/screenshots/after-process-paint-desktop.jpg)
![](docs/screenshots/after-compare-desktop.jpg)
![](docs/screenshots/after-case-desktop.jpg)

## Нужно подтвердить у владельца

Полный список с тем, что сделано на сайте: [`needs-confirmation.md`](clone-workspace/prototiplab/needs-confirmation.md).
Коротко: реальные фото работ (все текущие — рендеры); номер WhatsApp (был заглушкой, убран); рабочая почта
(домен с дефисом ≠ домену сайта, скрыта); цифры «1000+ проектов», «5+ лет», «50 мкм» (убраны); отзывы (убраны,
в одном было 200 наград против 120 в кейсе); цифры и публикуемость кейсов; разрешение на шлем, похожий на персонажа
франшизы; адрес и часы; **реквизиты оператора персональных данных — без них политику конфиденциальности публиковать
нельзя** (в тексте стоят плейсхолдеры); куда отправлять заявки; номер Метрики; список оборудования.

## Проверки

Нужен запущенный `npm run preview` в соседнем терминале и браузер Playwright (`npx playwright install chromium`).

```bash
npm run qa             # гейт стилей + интерактив + запрещённые приёмы
npm run qa:lighthouse  # CHROME_PATH=… Lighthouse mobile и desktop
```

| Проверка | Результат |
|---|---|
| Гейт `assert-styles.mjs` (90 утверждений из DESIGN.md, 1440 и 390 px, фокус) | **90/90, 0 ошибок**; цикл 1: 85/87 (два неоднозначных селектора), цикл 2 и 3: 90/90 — [`final-report.md`](clone-workspace/prototiplab/final-report.md) |
| Сборка | `astro build`, 17 страниц, exit 0 |
| Интерактив (`scripts/e2e.mjs`) | 36/36 |
| Запрещённые приёмы (`banned.md`, исходники + вычисленные стили 17 страниц) | 0 нарушений |

Lighthouse 13, локально (`dist` через `astro preview`), 27.09.2026:

| Маршрут | Устройство | Perf | A11y | Best pr. | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| / | mobile | 93 | 100 | 100 | 100 | 2.6 s | 0 ms | 0.055 |
| / | desktop | 100 | 100 | 100 | 100 | 0.5 s | 0 ms | 0.015 |
| /raschet/ | mobile | 97 | 100 | 100 | 100 | 2.1 s | 0 ms | 0.007 |
| /raschet/ | desktop | 100 | 100 | 100 | 100 | 0.5 s | 0 ms | 0.001 |
| /uslugi/skanirovanie/ | mobile | 96 | 100 | 100 | 100 | 2.1 s | 0 ms | 0.066 |
| /uslugi/skanirovanie/ | desktop | 100 | 100 | 100 | 100 | 0.5 s | 0 ms | 0.001 |
| /portfolio/ | mobile | 98 | 100 | 100 | 100 | 2.4 s | 0 ms | 0 |
| /portfolio/ | desktop | 100 | 100 | 100 | 100 | 0.3 s | 0 ms | 0.012 |

Lighthouse работает в headless Chrome с программным WebGL, поэтому мерит статичную версию первого экрана —
ту же, что получат слабые устройства. На устройстве с аппаратным WebGL three.js (136 КБ gzip) и GSAP (27 КБ gzip) подгружаются отдельным чанком только когда первый экран в зоне видимости и проверка возможностей пройдена.
Не проверено: Safari/WebKit (не запускается на машине сборки) и реальные данные CrUX до выкладки.

## Структура

```
src/data/          site.ts (контакты, процесс, технологии), services.ts, cases.ts — весь контент
src/components/    Header, Footer, Hero, ProcessScroll, Compare, QuoteForm, ServicesIndex, CaseCard, ObjectSvg…
src/scripts/       main.ts (появления, шапка, меню, Lenis), hero/process/compare/portfolio/quote.ts, object/ (three.js)
src/styles/        tokens.css (токены DESIGN.md), global.css
clone-workspace/   аудит, бренд, референс, план интерактива, DESIGN.md + assertions.json, QA, Lighthouse
scripts/           регрейд фото, редиректы, OG, гейт, e2e, запрещённые приёмы, Lighthouse, скриншоты
legacy/            прежний сайт как был
```

Методология: [per-simmons/clone-app-pat-pro-public](https://github.com/per-simmons/clone-app-pat-pro-public) —
контракт, стадии и гейт `assert-styles.mjs` (скопирован без изменений); вместо расширения Chrome — Playwright,
гейт проверяет новую дизайн-спецификацию, а не референс.
