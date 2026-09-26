# Design System: ПРОТОТИП LAB — «Грунт и графит»

Provenance on every token: **brand** (Stage 1, `brand.md`), **reference** (Terminal Industries system, `reference.md`),
**derived** (computed from the other two; the note says how). Brand owns colour, fonts, imagery; the reference owns
proportions, rhythm and motion. Evidence column cites the source measurement or decision.

## Visual Theme

ПРОТОТИП LAB reads like **a workbench under one good lamp**: light primer-grey surfaces, near-black graphite
chapters, one amber signal colour used as sparingly as a nozzle light. Contrast is high and flat — no gradients,
no shadows, no glass. Density is calm: one idea per viewport, big weight-400 display type with tight tracking,
mono uppercase labels that read like a job ticket. Corners are square (0) on surfaces, 2 px on controls.
Motion is confident and slow-out (expo-out 0.6–1 s): lines rise from masks, chapters swap light↔dark with a notched
edge, and the hero object changes material state — wireframe, printed layers, primer, paint — as you watch.

## Colors

| Token | Hex | RGB | Role | Provenance | Evidence |
|---|---|---|---|---|---|
| `--c-primer` | #E4E3DE | rgb(228,227,222) | page background | brand | brand.md palette, 58% |
| `--c-primer-deep` | #D3D2CC | rgb(211,210,204) | panels, table stripes, input fill | brand | brand.md |
| `--c-graphite` | #141413 | rgb(20,20,19) | text, dark chapters, primary button | brand | brand.md; 14.34:1 on primer |
| `--c-graphite-2` | #232321 | rgb(35,35,33) | surfaces on dark | brand | brand.md |
| `--c-ink-muted` | #55544F | rgb(85,84,79) | secondary text on light | brand | 5.91:1 on primer, 5.01:1 on primer-deep (was #5C5B57 = 4.49:1 on deep, failed Lighthouse) |
| `--c-primer-muted` | #9A9993 | rgb(154,153,147) | secondary text on dark | brand | 6.45:1 on graphite |
| `--c-amber` | #FF5A1F | rgb(255,90,31) | signal fill, active step, nozzle, focus ring | brand | 5.91:1 with graphite text |
| `--c-line` | rgba(20,20,19,.14) | — | hairlines and grid on light | derived | graphite at 14% (reference uses 5–20% alpha lines of its dark green) |
| `--c-line-dark` | rgba(228,227,222,.16) | — | hairlines on dark | derived | primer at 16% |
| `--c-error` | #B3261E | rgb(179,38,30) | form errors on light (text) | derived | 5.09:1 on primer; not a brand colour, UI state only |

**Gradients:** none (banned). The only `background-image` in UI is the 1 px technical grid made of `--c-line`.

## Typography

| Token | Value | Provenance | Evidence |
|---|---|---|---|
| `--f-sans` | "Geologica Variable", "Geologica", system-ui, sans-serif | brand | brand.md; OFL, self-hosted |
| `--f-mono` | "JetBrains Mono Variable", "JetBrains Mono", ui-monospace, monospace | brand | brand.md |
| Display weight | 400 | reference | Terminal H1/H2 w400 |
| Lead weight | 450 | reference | Terminal lead P w450 |

Type scale (fluid; the px value is at the 1440 reference viewport, the second at 390):

| Class | Size | @1440 | @390 | line-height | letter-spacing | Provenance |
|---|---|---|---|---|---|---|
| `.t-mega` | clamp(56px, 5.73vw, 120px) | 82.5px | 56px | 0.95 | −0.03em | reference (Display XL 82.5/58) |
| `.t-display` (H1) | clamp(40px, 4.861vw, 96px) | 70px | 40px | 0.95 | −0.05em | reference (H1 70/40, −0.051em) |
| `.t-h2` | clamp(32px, 3.333vw, 64px) | 48px | 32px | 1.05 | −0.02em | reference (H2 48; mobile 32) |
| `.t-lead` | clamp(22px, 2.4vw, 40px) | 34.56px | 22px | 1.2 | −0.018em | reference (Lead 34.5 w450) |
| `.t-h3` | clamp(22px, 1.875vw, 30px) | 27px | 22px | 1.2 | −0.015em | reference (H3 27) · lh derived tighter for Cyrillic 2-line titles |
| `.t-body-l` | clamp(18px, 1.389vw, 22px) | 20px | 18px | 1.46 | −0.01em | reference (Body L 20) |
| body | 16px | 16px | 16px | 1.5 | 0 | reference |
| `.t-nav` | 14px w450 | 14px | — | 1 | 0.03em | reference (nav 14 w450 +0.03em) |
| `.t-label` | 12px mono w600 UPPERCASE | 12px | 11px | 1.2 | 0.16em | reference (13/11 mono, 0.18em) · derived: 12px because Cyrillic caps in JetBrains Mono are wider than Geist Mono |
| `.btn` label | 13px mono w600 UPPERCASE | 13px | 13px | 1 | 0.14em | reference (button 13 w600 0.18em) · derived 0.14em: «РАССЧИТАТЬ ПРОЕКТ» fits 44 px tap target width on 320 px |

## Spacing

| Token | Value | Provenance | Evidence |
|---|---|---|---|
| `--margin` | clamp(20px, 4.861vw, 96px) | reference | 70px @1440, 20px @390 |
| `--gap` | clamp(10px, 1.042vw, 20px) | reference | 15px @1440 |
| `--cols` | 12 (desktop) / 4 (≤767) | reference · derived mobile 4 | Terminal 12-col; mobile collapses to 1–2 |
| `--section-y` | clamp(72px, 8.333vw, 160px) | reference | 90–120px padding → 120 @1440 |
| `--s-1…--s-8` | 4, 8, 12, 16, 24, 32, 48, 64 px | derived | 4 px base under the reference's 15/20/24/40 gaps |
| Measure | 34ch for lead, 60ch for body | derived | Terminal narrow column 900px ≈ 60ch of 20px text |

## Border radius

| Token | Value | Provenance | Evidence |
|---|---|---|---|
| `--r-0` | 0 | reference | 2249/2296 boxes at 0 |
| `--r-ctl` | 2px | brand | banned.md #10 (stricter than reference 8px) |

## Shadows / effects

None on content (reference: `box-shadow: none` on content; brand: banned glow). `backdrop-filter: none` everywhere.
Chapter edge: `clip-path` notch `polygon(0 0, calc(100% - 64px) 0, 100% 64px, 100% 100%, 0 100%)` — **reference** (notched panels) · size derived.

## Motion

| Token | Value | Provenance | Evidence |
|---|---|---|---|
| `--ease-out` | cubic-bezier(0.19, 1, 0.22, 1) | reference | 35 authored rules (expo-out) |
| `--ease-hover` | cubic-bezier(0.39, 0.575, 0.565, 1) | reference | 47 authored rules (sine-out) |
| `--ease-ui` | cubic-bezier(0.4, 0, 0.2, 1) | reference | 21 rules |
| `--d-fast` | 0.3s | reference | hover durations |
| `--d-base` | 0.6s | derived | midpoint of reference 0.35/1s, used for image clip |
| `--d-slow` | 1s | reference | reveal duration |
| `--stagger` | 0.08s | derived | line reveal step; reference staggers visually ≈ 60–100ms |
| Chapter colour morph | 0.5s | reference | `color-transition 0.5s` |
| Page transition | 0.5s curtain | derived | View Transitions, same ease |

Reduced motion: all durations → 0.01 ms, no pinning, no smooth scroll, 3D shows static render.

## States

| Element | Rest | Hover | Focus-visible | Active / pressed | Disabled |
|---|---|---|---|---|---|
| `.btn` | graphite bg, primer text | amber wipe L→R, graphite text, arrow +4px | 2px amber outline, 3px offset | translateY(1px) | 40% opacity, cursor not-allowed |
| `.btn--signal` | amber bg, graphite text | graphite wipe, primer text | same ring (graphite on amber) | same | same |
| `.link-u` | underline 1px, offset 4px | underline thickness 2px, amber colour line | ring | — | — |
| chip `[aria-pressed]` | 1px line border | graphite border | ring | graphite fill, primer text | — |
| input | primer-deep fill, 1px line bottom | bottom graphite | bottom 2px amber + ring | — | — |
| `aria-invalid` | bottom 2px error, message below | — | — | — | — |

## Layout / breakpoints

reference: 480 / 768 / 1024 / 1280 / 1440. Mobile nav ≤ 1023 px (full-screen graphite menu). Header height 72px (derived: 44px tap target + 2×14).

## Assets

- Fonts: npm `@fontsource-variable/geologica`, `@fontsource-variable/jetbrains-mono` (woff2, bundled).
- Images: `src/assets/photos/*.webp` — the studio's published images, regraded (see `assets/SOURCES.md`).
- 3D: procedural, `src/scripts/object/*.ts`. No model files.

## Design Guardrails

Do:
- Let the object lead: every page has one thing that is shown, not described (3D, SVG profile, section drawing, photo).
- Use mono labels as a job ticket: `01 / Модель`, `Срок · 2 недели`.
- Alternate primer and graphite chapters; the notched corner marks the switch.
- Keep one amber element per viewport.
Don't:
- No gradients, glows, glass, shadows, pills, emoji, icon packs, stat rows, testimonials, centred two-button hero.
- No amber text on primer (fails contrast).
- No invented numbers; specs are either the studio's case facts or labelled generic technology ranges.

## Agent Prompt Guide

To build a new page: start with `Base.astro`, pick chapters from `components/`, use `.wrap` + `.grid-12` for layout,
headings `.t-display`/`.t-h2` with `data-reveal="lines"`, labels `.t-label`, one primary `.btn` per viewport
(`.btn--signal` only for «Рассчитать проект»). Dark chapter: `<section class="chapter chapter--dark">`. Everything else
comes from `src/styles/tokens.css`.
