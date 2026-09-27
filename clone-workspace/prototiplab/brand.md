# Brand — «Спектр» (v2, 27.09.2026)

v1 «Грунт и графит» (primer grey, graphite, one amber accent, 2 px corners) was rejected by the owner on
27.09.2026: *"no boxy buttons and designs. this must be super high tech, colorfull and design savy site. This is
3d printing technologies, it must fit this feel."* v1 stays in git history (commit 16868ad).

## Idea

Rainbow silk PLA — the filament every maker knows: one continuous strand that shifts through the spectrum as it
is extruded. The site *is* that strand: a spectrum line extrudes down every page with a nozzle at its head; each
service owns one colour of the strand; the first screen is a build chamber where parts print layer by layer.

## Colour

| Token | Hex | Role |
|---|---|---|
| fog | `#EDEFF4` | page base — cool, light, "lab" |
| paper | `#F8F9FC` | cards on fog |
| fog-2 | `#E1E4EC` | pressed/hover surfaces, media placeholders |
| ink | `#0B0C10` | text, stage cards, primary pills |
| muted | `#4C5060` | secondary text on fog (7.0:1) |
| muted-dark | `#A3A8B8` | secondary text on ink (8.1:1) |
| cyan | `#00C2FF` | 3D-сканирование и реверс-инжиниринг |
| blue | `#2F5BFF` | 3D-моделирование (white text on it) |
| magenta | `#FF2E8E` | Фигурки |
| orange | `#FF6A1A` | Корпоративный мерч; FDM in the comparison |
| yellow | `#FFC61A` | Прототипирование |
| lime | `#B6F500` | Косплей; focus on dark; "ready" states |
| spectrum | cyan → blue → magenta → orange → yellow → lime | the filament line, hero accent words, CTA, footer wordmark, progress |

Ink text on every filament colour except blue (white). The old site's violet (#6D4DFF family) stays banned.

## Type

- **Onest Variable** (OFL, native Cyrillic) — display at weight 350 with −0.05 em tracking (huge and light),
  UI and body at 400–500.
- **JetBrains Mono Variable** — labels, counters, layer numbers.

## Form

- Every control is a pill (999 px). Every surface is a soft card: 20–32 px (2 vw), media 14–22 px.
- Dark and deep chapters are cards inset from the viewport edge, never full-bleed boxes.
- Pills carry a spinning spectrum dot; on hover the dot floods the pill with the spectrum.
- Cards flood with their service colour from the point where the cursor entered.
- Crosshair "+" rules between hero and content.

## Imagery

1. **Code first**: the hero cluster (three.js, 14 procedural printed parts), the process silhouette (SVG, five
   stages), the FDM/SLA cross-section (canvas).
2. **Studio images**: the 20 published renders from the old site, violet light re-lit in the colour of each
   image's service. Labelled as illustrations.
3. Generation: none needed (budget untouched).

## Logo

Rounded ink tile with three printed layers (cyan, magenta, and a lime layer still being laid with its nozzle
dot) + ПРОТОТИП in Onest 600 + LAB as an ink pill. Drawn in code (`src/components/Logo.astro`, `public/favicon.svg`).

## Voice

Unchanged from v1 — the studio's own copy, tightened; no invented numbers (see `needs-confirmation.md`).
