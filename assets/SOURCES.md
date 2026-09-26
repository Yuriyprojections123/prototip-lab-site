# Asset source manifest

| Asset | Source | Licence / rights | Processing |
|---|---|---|---|
| `src/assets/photos/*.webp` (20 files) | The studio's own published images from the previous prototiplab.ru (`legacy/assets/`, byte-identical to production on 26.09.2026) | Studio's own content | `scripts/regrade-photos.py`: pixels in the violet/blue hue band are rotated to the filament colour of the image's service (+25 % saturation), the rest −30 % saturation, +5 % contrast. Astro re-encodes to responsive WebP at build |
| — note | All 20 images are AI-generated renders, not photographs of real jobs | — | Captioned «иллюстрация» on the site; owner asked for real photos (`needs-confirmation.md` #1) |
| Hero 3D cluster (14 printed parts, print-in, layer ridges, modes) | Code: `src/scripts/object/cluster.ts` (three.js procedural geometry + shader patch) | Ours | — |
| Hero static stills `src/assets/hero-still.webp`, `hero-still-m.webp` | Render of our own three.js scene in headless Chromium (silk PLA mode, canvas only) | Ours | WebP q80; shown when 3D is not run |
| Process silhouette (five stages), 404 / services art | Code: `src/components/LayerArt.astro` (SVG) | Ours | — |
| FDM/SLA cross-section | Code: `src/scripts/compare.ts` (Canvas 2D) | Ours | — |
| Filament line | Code: `src/scripts/filament.ts` (SVG path from the page's chapter boundaries) | Ours | — |
| Wordmark, favicon | Code: `src/components/Logo.astro`, `public/favicon.svg` | Ours | — |
| Open Graph card `public/og.png` | Screenshot of the site's own hero, `scripts/og.mjs` | Ours | — |
| Onest (variable) | npm `@fontsource-variable/onest` — self-hosted woff2 in the build | SIL OFL 1.1 | Cyrillic, Cyrillic-ext, Latin subsets via `unicode-range` |
| JetBrains Mono (variable) | npm `@fontsource-variable/jetbrains-mono` 5.3 — self-hosted woff2 | SIL OFL 1.1 | same |
| three.js 0.186, GSAP 3.15, Lenis 1.3 | npm | MIT / GSAP standard licence (free, incl. commercial) / MIT | bundled by Vite |
| Generated images | none | — | OpenRouter spend $0.00 — see `clone-workspace/prototiplab/image-ledger.md` |
| Anything from Lusion (v2 reference) or Terminal Industries / Igloo Inc (v1) | **nothing** — only the system: proportions, radii, rhythm and motion ideas | — | — |
