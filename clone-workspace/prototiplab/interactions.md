# Stage 3 — Interactive layer plan

Motion vocabulary comes from Terminal Industries (expo-out reveals 0.35–1 s, sine-out hovers 0.3 s, masked line
reveals, pinned chapters, live calculator) plus Igloo's material-state object. Everything below has a
`prefers-reduced-motion` path and a no-WebGL / low-end path.

## 1. Hero object — «Образец» (home)
- **Object:** a procedural product-design sample built in code: a turned vase/award-like body of revolution
  (LatheGeometry from a profile curve with a fillet and a chamfered base) plus a boolean-looking slot rendered as a
  separate inset ring. Reads as "a thing the studio would make" — not a character, not a franchise.
- **States (buttons `01 Каркас / 02 Печать / 03 Грунт / 04 Покраска`, auto-cycles once on load):**
  1. *Каркас* — wireframe edges only, graphite lines on primer.
  2. *Печать* — a clipping plane rises; the part below is solid with visible layer banding (shader stripes every 0.2 "mm"),
     an amber ring (the nozzle) rides the cut. Layer counter in mono ticks: `Слой 128 / 412`.
  3. *Грунт* — matte primer grey, roughness 0.9, layer lines fade (sanding).
  4. *Покраска* — graphite satin body, amber inlay ring, clearcoat highlight.
- **Input:** drag to rotate (pointer + touch, inertia), idle slow turn, cursor tilt ±8°. Keyboard: arrow keys rotate
  when canvas focused; state buttons are real `<button>`s with `aria-pressed`.
- **Fallback:** `navigator.hardwareConcurrency <= 4 && deviceMemory <= 4`, no WebGL, `Save-Data`, or reduced motion
  → a static pre-rendered SVG of the painted state (drawn in code, same silhouette) with the state buttons swapping
  SVG variants (wire/print/primer/paint). three.js is lazy-loaded only when the hero is visible and the device qualifies.

## 2. Process scroll — «Один предмет, пять этапов» (home)
- Pinned 5-step chapter, 500 vh. The same object (a smaller instance of the hero geometry, rendered in its own canvas)
  is scrubbed by scroll: Идея (pencil sketch: SVG profile line drawn with stroke-dashoffset) → Модель (wireframe) →
  Печать (layer clip rising) → Постобработка (primer) → Готовое изделие (painted, turns 180°).
- Left column: step number in mono, title, the studio's own step copy. Progress rail with 5 ticks.
- Mobile / reduced motion: unpinned vertical list; each step shows a static SVG frame of that state.

## 3. FDM vs SLA — «Сравнение технологий» (home + prototyping page)
- Split view with a draggable divider (pointer, touch, keyboard ←/→ on a `role="slider"` handle).
- Left: FDM — a canvas-drawn cross-section of a curved surface with 0.2 mm stair-stepping; Right: SLA — the same
  curve at 0.05 mm. A magnifier loupe follows the pointer over the surface.
- Below: comparison table (слой, поверхность, прочность, размер, лучше всего для) with a toggle `FDM | SLA | оба`.
  Values are **generic technology ranges** (labelled «типично для технологии»), not claims about the studio's fleet.
- Reduced motion: divider still works, no loupe animation.

## 4. Portfolio filter (portfolio page)
- Filter chips: Все · Мерч · Фигурки · Косплей · Прототипы · Реверс-инжиниринг. URL-synced `?cat=`.
- Items re-flow with FLIP (expo-out 0.6 s), count updates in mono. Cases open to full case pages; gallery items
  without a case are honest «иллюстрация направления» tiles linking to the matching service.
- Case pages: sticky facts rail (клиент / срок / технологии), 5 numbered chapters, image stepping, prev/next.

## 5. Quote flow «Рассчитать проект» (`/raschet/`, also opened from every CTA)
Steps (each its own fieldset, progress in mono `02 / 06`):
1. **Задача** — radio cards: Фигурка / Косплей / Мерч / Прототип / Реверс-инжиниринг / Моделирование / Другое.
2. **Размер** — slider 1–100 cm + presets (ладонь / А4 / шлем / крупный) → a live outline scales in a mm grid.
3. **Тираж** — 1 / 2–10 / 11–100 / 100+ .
4. **Срок** — Не горит / 2–4 недели / Срочно + optional date.
5. **Файлы** — drop zone (photo, sketch, STL/OBJ/STEP, up to 10 files × 25 MB), previews, remove.
6. **Контакт** — имя, телефон/email/Telegram, комментарий, **152-ФЗ consent checkbox** linking to
   `/politika-konfidencialnosti/` (required, unchecked by default).
- Live summary panel (Terminal's calculator pattern) — echoes choices; **no price is invented**, it says what the
  studio will need and «оценку пришлём в течение рабочего дня» (from the old site).
- Validation inline on blur + on step advance, `aria-invalid`, `aria-describedby`, focus to first error.
- States: idle, validating, sending (button spinner, disabled), success (summary + Telegram shortcut), error
  (message + «Отправить в Telegram» fallback that pre-fills the brief text).
- **Endpoint:** `PUBLIC_QUOTE_ENDPOINT` (build-time env). Empty by default → the form does **not** send anything; it
  shows the success-state variant «Отправка не настроена — скопируйте бриф в Telegram» and copies the brief. Payload
  is `multipart/form-data`, documented in README.
- Telegram shortcut on every step: `https://t.me/prototiplab`.

## 6. Global motion
- Masked line reveal for H1/H2 (expo-out 1 s, 80 ms stagger per line).
- Section chapter swap light ↔ graphite with notched corner (clip-path), header colour morph 0.5 s.
- Mono button hover: amber fill wipes from left (0.3 s sine-out), arrow shifts 4 px.
- Image hover on cards: clip inset 0 → 3 % + scale 1.04 (0.6 s expo-out).
- Page transitions: native cross-document View Transitions (`@view-transition { navigation: auto }`) — graphite
  curtain wipe up 0.5 s; browsers without support navigate normally.
- Loading: first visit only — mono layer counter 000 → 100 over real font/hero readiness (max 1.2 s), then curtain lifts.
- Smooth scroll: Lenis on pointer-fine devices only; off for reduced motion and touch.
