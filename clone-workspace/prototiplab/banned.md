# Banned patterns

Checked in Stage 7 by `scripts/check-banned.mjs` (grep over `src/` + computed-style scan of built pages) and by eye.

| # | Banned | Machine check |
|---|---|---|
| 1 | Violet / blue gradients, any hue 230°–290° as a brand colour | no computed `color`/`background*` with hue 230–290 and saturation > 25% |
| 2 | Glassmorphism | no `backdrop-filter` other than `none` |
| 3 | Glowing blobs (large blurred radial gradients, coloured glow shadows) | no `radial-gradient` in `background-image` of section-level blocks; no coloured `box-shadow` |
| 4 | Default Inter (or Manrope/Unbounded) as the identity | computed `font-family` first family ∈ brand fonts only |
| 5 | Emoji or generic icon-pack icons (Lucide/Heroicons/FA), Unicode pseudo-icons `✎ ◉ ▦` | grep `src/` for emoji ranges, `lucide`, `heroicons`, `fontawesome` |
| 6 | Fake stats, fake reviews | no stat row, no testimonial component; `needs-confirmation.md` items absent from copy |
| 7 | Uniform card grids with identical radii and shadows | cards: radius 0–2px, no shadow; grids vary column spans |
| 8 | Centered hero with two buttons over a collage | hero is left-weighted type + live 3D object; one primary action |
| 9 | Fade-up-on-scroll as the only motion | motion vocabulary: masked line reveals, clip wipes, scrubbed 3D state, counters of *real* specs only, hover choreography |
| 10 | Pill buttons with coloured glow shadow | button radius ≤ 2px |
| 11 | Third-party characters/franchises as hero, brand or generated imagery | no franchise names; case imagery only on its case |
| 12 | Fonts or scripts from external CDNs | no `googleapis`, `gstatic`, `cdnjs`, `unpkg`, `jsdelivr` in `dist/` |
| 13 | Lorem ipsum or invented facts | grep `lorem`; copy reviewed against `01-recon/content-dump.md` |
| 14 | Anything from the Awwwards reference (assets, fonts, code, copy) | only the system is borrowed |
