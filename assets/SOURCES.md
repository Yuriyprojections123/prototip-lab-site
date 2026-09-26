# Asset source manifest

| Asset | Source | Licence / rights | Processing |
|---|---|---|---|
| `src/assets/photos/*.webp` (20 files) | The studio's own published images from the previous prototiplab.ru (`legacy/assets/`, byte-identical to production on 26.09.2026) | Studio's own content | `scripts/regrade-photos.py`: violet/blue hue band desaturated to neutral, 15% global desaturation, warm primer cast, +6% contrast. Astro re-encodes to responsive WebP at build |
| — note | All 20 images are AI-generated renders, not photographs of real jobs | — | Captioned «иллюстрация» on the site; owner asked for real photos (`needs-confirmation.md` #1) |
| «Образец» 3D object, all material states | Code: `src/scripts/object/profile.ts`, `sample.ts` (three.js LatheGeometry + shader patches) | Ours | — |
| Static object renders (hero fallback, process frames, 404, services) | Code: `src/components/ObjectSvg.astro`, same profile as the 3D object | Ours | — |
| FDM/SLA cross-section | Code: `src/scripts/compare.ts` (Canvas 2D) | Ours | — |
| Wordmark, favicon | Code: `src/components/Logo.astro`, `public/favicon.svg` | Ours | — |
| Open Graph card `public/og.png` | Screenshot of the site's own hero, `scripts/og.mjs` | Ours | — |
| Geologica (variable) | npm `@fontsource-variable/geologica` 5.3 — self-hosted woff2 in the build | SIL OFL 1.1 | Cyrillic, Cyrillic-ext, Latin subsets via `unicode-range` |
| JetBrains Mono (variable) | npm `@fontsource-variable/jetbrains-mono` 5.3 — self-hosted woff2 | SIL OFL 1.1 | same |
| three.js 0.186, GSAP 3.15, Lenis 1.3 | npm | MIT / GSAP standard licence (free, incl. commercial) / MIT | bundled by Vite |
| Generated images | none | — | OpenRouter spend $0.00 — see `clone-workspace/prototiplab/image-ledger.md` |
| Anything from Terminal Industries or Igloo Inc | **nothing** — only measured proportions, rhythm and motion values | — | — |
