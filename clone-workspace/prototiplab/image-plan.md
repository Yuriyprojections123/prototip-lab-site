# Stage 5 — Image plan

Budget: $0.70 on OpenRouter. Planned spend: **$0.00** — every role below is covered by code or by the studio's own
published images. `OPENROUTER_API_KEY` is also absent from the build environment, so no call could be made.

| # | Image | Role | Size / aspect | Source |
|---|---|---|---|---|
| 1 | Hero object «Образец» in 4 material states | home hero | canvas, full-bleed right 7/12 | **code** — three.js LatheGeometry + shaders (`src/scripts/object/`) |
| 2 | Hero static fallback (4 states) | low-end / reduced motion / no-JS | SVG 800×900 | **code** — `HeroFallback.astro` SVG |
| 3 | Process object, 5 states | home process scroll | canvas 1:1 | **code** — same geometry module |
| 4 | FDM vs SLA surface cross-section | comparison | canvas 16:9 | **code** — Canvas 2D stair-step renderer |
| 5 | Quote size outline in mm grid | quote step 2 | SVG | **code** |
| 6 | Service page key visuals (6) | service heroes | 4:3 | **studio images** regraded: modeling, scanner, figurine-portrait, merch, cosplay-armor, prototype |
| 7 | Case imagery (3 cases × 3–4) | case pages | 4:3 | **studio images** regraded: award-*, helmet-*, part-* |
| 8 | Portfolio tiles | portfolio grid | 4:3 | **studio images** regraded (each image used once, honest captions) |
| 9 | About: workshop | about | 4:3 | **studio images** regraded: studio, helmet-paint |
| 10 | Object drawings in material states | `/uslugi/`, 404, process list | SVG | **code** — `ObjectSvg.astro` (same profile as the 3D object; replaced the planned per-service glyphs — one object, one language) |
| 11 | Open Graph card | social previews | 1200×630 PNG | **code** — SVG rendered to PNG at build by `scripts/og.mjs` |
| 12 | Favicon / wordmark | brand | SVG | **code** |

Generation candidates rejected: «studio still life of primed objects» (covered by #1/#3, which are better because they
are interactive), «workshop photo» (a generated workshop would be one more fake; asking the owner instead —
`needs-confirmation.md` #1).
