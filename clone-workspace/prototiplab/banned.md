# Banned patterns — v2 («Спектр»)

v1 («Грунт и графит») banned colour, gradients and rounded controls. The owner rejected that direction on
27.09.2026 ("no boxy buttons and designs … super high tech, colourful"), so v2 inverts rules 1, 7 and 10
and keeps everything that protects quality and honesty. Machine checks: `npm run qa:banned`
(`scripts/check-banned.mjs`).

| # | Banned | Check |
|---|---|---|
| 1 | The old site's violet as a brand colour (#6D4DFF family) | grep for the old hex values; no computed colour with hue 245°–290° and saturation > 50 % |
| 2 | Glassmorphism | no `backdrop-filter` other than `none` |
| 3 | Glowing blobs (blurred radial gradients, coloured glow shadows) | no `radial-gradient`; no blurred `box-shadow` (rings and insets only) |
| 4 | Generic identity fonts (Inter, Manrope, Unbounded) | computed first font family ∈ Onest / JetBrains Mono |
| 5 | Emoji, icon packs (Lucide/Heroicons/FA), Unicode pseudo-icons | grep `src/` |
| 6 | Fake stats, fake reviews | no stat row, no testimonial component; `needs-confirmation.md` items absent from copy |
| 7 | **Boxy controls and surfaces** (v2) — square buttons, square cards, hairline tables as the main surface | every visible `button`/`.btn`/`.chip`/`.filter-chip` has radius ≥ min(height/2, 12px); cards and media ≥ 12px |
| 8 | Centered hero with two buttons over a collage | hero is a stage card with a live 3D cluster and a left-weighted headline |
| 9 | Fade-up-on-scroll as the only motion | motion vocabulary: layer-by-layer print-in, pointer physics, filament extrusion on scroll, pinned horizontal process, pointer-origin colour floods, masked line reveals |
| 10 | Monochrome UI (v2) — colour only in photos | every page carries the filament spectrum (line, chips, cards) |
| 11 | Third-party characters/franchises as hero, brand or generated imagery | no franchise names; hero parts are generic engineering primitives |
| 12 | Fonts or scripts from external CDNs | no `googleapis`, `gstatic`, `cdnjs`, `unpkg`, `jsdelivr` in `dist/` |
| 13 | Lorem ipsum or invented facts | grep `lorem`; copy reviewed against `01-recon/content-dump.md` |
| 14 | Anything from the Awwwards reference (Lusion v3): assets, fonts (Aeonik), code, copy, its cross-shaped hero parts, its blue #0016EC | only the system is borrowed — see `reference.md` |
