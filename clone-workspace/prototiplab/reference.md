# Stage 2 — Awwwards reference

Awards verified on 26.09.2026 against awwwards.com listing pages
(`/websites/sites_of_the_month/`, `/websites/sites_of_the_year/`) and each site's `/sites/<slug>` page;
Day/Honors details from `Knowledge/Obsidian/03-AI-OS/References/Awwwards-Design-References.md`.
Each site was opened in headless Chromium 1440×900 and 390×844, scrolled end to end, and its computed styles
and CSSOM were read (`ref-extract.mjs`; raw output kept in the job scratch dir, not committed — it is their system data, not ours).

## Shortlist and scores (1–5)

| Site | Award (verified) | Objects & materials | Carries our structure | Craft | Fits «Грунт и графит» | Mobile / a11y | Total |
|---|---|---|---|---|---|---|---|
| **[Terminal Industries](https://terminal-industries.com)** | **Site of the Month, Sep 2025**; SOTD 3.09.2025; Developer Award | 4 — hardware (trucks, yard) shown as hard-lit objects on flat fields | **5** — problem → system → result chapters, one idea per screen, a live ROI calculator next to a form (= our quote flow), FAQ, dark/light chapter alternation | 5 — 12-col grid, 70 px margins, mono uppercase labels, weight-400 display type with −0.05 em tracking | 5 — light neutral base + near-black chapters + one signal colour: the same logic as primer/graphite/amber | 4 — loads in ~27 s on this VPS but content-first; `prefers-reduced-motion` rules present; Dev a11y 7.0 | **23** |
| [Igloo Inc](https://www.igloo.inc) | Site of the Year 2024; Site of the Month | **5** — one object that changes material state (wire lattice → solid blocks) under scroll | 1 — a single immersive object, no service/portfolio structure | 5 | 3 — cold blue-grey, sci-fi UI | 1 — full WebGL, 77 s to settle here, no content without JS | 15 |
| [Lando Norris](https://landonorris.com) | Site of the Year 2025; Site of the Month | 3 — helmet renders, topographic lines | 2 — personal brand/fan site | 5 | 2 — neon lime on cream | 2 — 21 canvases, 69 s | 14 |
| [Floema](https://www.floema.com/en) | Site of the Month, May 2026 | 4 — furniture photographed in place, material colour chips | 4 — catalogue + product families + contacts | 5 — 24-col grid, 1.8 vw margins, expo-out motion | 3 — warm beige photo storytelling; needs real photography we do not have | 3 — cookie wall over everything, a11y 7.0 | 19 |
| [Montfort](https://mont-fort.com) | Site of the Month, Jun 2025 | 1 — energy trading, clouds and ships | 3 — divisions as chapters | 4 | 1 — uppercase thin type on sky photos | 2 — 98 s to settle, 2 canvases | 11 |
| [Opal Tadpole](https://www.opalcamera.com/opal-tadpole) | Site of the Year 2024 | — | — | — | — | — | **disqualified**: the awarded page now serves the unrelated «the table» manifesto; the awarded work is not publicly reachable |

## Choice

- **Primary: Terminal Industries** — the only candidate whose *structure* already holds a services studio with a
  calculator-driven conversion, and whose system (neutral light base, near-black chapters, one signal colour,
  mono labels, flat 0-radius surfaces) is the same shape as our brand direction without copying its look.
- **Secondary: Igloo Inc — for one quality only:** the object that changes material state as you scroll.
  We take the idea «one object, several material states, scroll-scrubbed», not its visuals, shaders or models.

Nothing is downloaded from either site: no images, video, fonts (Terminal uses Suisse Intl + Geist Mono — ours are
Geologica + JetBrains Mono), no code.

## Terminal Industries — extracted system (what we borrow)

Measured at 1440×900 unless noted; mobile at 390×844.

### Grid and container
| Token | Value | Evidence |
|---|---|---|
| Columns | 12 | `gridTemplateColumns` 12 cols ×5 grids |
| Column gap | 15 px @1440 → **1.04 vw** | `12 cols gap 15.0048px` |
| Side margin | 70 px @1440 → **4.86 vw**; 20 px @390 (5.1 vw) | `containerLeft 70px w1300`; mobile `20px w350` ×162 |
| Narrow measure | 900 px centred (270 px left) for statements | `270px w900` ×5 |
| Breakpoints | 480 / 640 / 768 / 1024 / 1280 / 1440 / 1680 / 1920 | CSSOM `@media` |

### Type scale (ratio ≈ 1.2, weight 400 for display)
| Role | Desktop | Mobile | line-height | tracking | Evidence |
|---|---|---|---|---|---|
| Display XL | 82.5 px | 58 px | 0.95 | −0.018 em | H2 ×3 |
| Display / H1 | 70 px | 40 px | 0.95–1.00 | **−0.051 em** | H1, H2 ×5 |
| H2 | 48 px | 40 px | 1.05 | −0.018 em | H2 ×2 |
| Lead | 34.5 px, w450 | 32 px | 1.20 | −0.018 em | P ×4 |
| H3 | 27 px | 24 px | 1.46 | −0.015 em | P, H3 |
| Body L | 20 px | 20 px | 1.46 | −0.010 em | A ×9 |
| Body | 16 px | 16 px | 1.50 | 0 | A, BUTTON |
| Nav | 14 px w450 | — | 1.00 | +0.030 em | A ×64 |
| Mono label / button | 13 px w600 UPPERCASE | 11–13 px | 0.81 (box by padding) | **+0.18 em** | BUTTON ×9 Geist Mono |

### Spacing and pacing
- Section padding 90–120 px top, 90 px bottom desktop; 60–90 px mobile. → vertical rhythm unit **clamp(64px, 8.3vw, 120px)**.
- One idea per viewport: most chapters are 100 vh tall with pinned media and 2–4 stepping text blocks.
- Chapter change = background swap light ↔ near-black with a **notched edge** (clip-path cut into the panel corner).

### Motion
| Token | Value | Evidence |
|---|---|---|
| Reveal ease | `cubic-bezier(0.19, 1, 0.22, 1)` (expo-out) | 35 authored rules; durations 0.35 s, 1 s |
| Hover ease | `cubic-bezier(0.39, 0.575, 0.565, 1)` (sine-out), 0.3 s | 47 authored rules |
| UI ease | `cubic-bezier(0.4, 0, 0.2, 1)`, 0.4 s | 21 rules; default `0.4s ease` ×525 |
| Header colour morph | 0.5 s on chapter change | `color-transition 0.5s ease` ×525 |
| Scroll | Lenis smooth scroll | `html.lenis` |
| Reduced motion | honoured | `(prefers-reduced-motion: reduce)` in CSSOM |

Choreography observed: headings enter line by line from a mask; numbers tick; sticky media swaps while copy steps;
buttons are mono uppercase with a fill that wipes on hover; calculator output updates live as inputs change.

### Surfaces
Radius 0 on 2249 of 2296 boxes; 8 px only on small controls; no shadows on content. We keep 0 and go to **2 px** on
controls (brand/banned rule, stricter than the reference).

## Igloo Inc — the one borrowed quality
Scroll position drives the object's *material state*: sparse wire lattice → assembled blocks → lit solid. We map
this to our print pipeline: **каркас → слои печати → грунт → покраска**, with a visible print head drawing layers.
