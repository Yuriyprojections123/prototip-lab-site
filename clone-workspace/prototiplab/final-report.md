# Final report — CONVERGED-PASS

Gate (contract §5): `style_assertions.failed == 0` AND `npm run build` exits 0.

| Cycle | Assertions | Failed | What changed |
|---|---|---|---|
| 1 | 87 | 2 | `/ .btn--ghost` and `/ .chapter` matched the wrong archetype (dark-chapter ghost button; hero's header-offset padding). Selectors pinned to one archetype each, as §5.2 requires — no token or CSS value changed |
| 2 | 90 | **0** | — |
| 3 | 90 | **0** | after the a11y contrast fix (`--c-ink-muted` #5C5B57 → #55544F, not an asserted token) |
| final (`npm run qa`) | 90 | **0** | against `npm run preview` |

Build: `astro build` → 17 pages, exit 0.

## Beyond the gate

- Interaction coverage (`scripts/e2e.mjs`): 36/36 — hero states, layer counter, compare slider (keyboard), table toggle,
  process scrub, mobile menu (focus trap, Esc), portfolio filter + `?cat=`, quote flow (validation, files, summary,
  consent, offline/success/error states, multipart payload), reduced-motion fallback without three.js, legacy URL forward,
  no external requests, no JS errors.
- Banned patterns (`scripts/check-banned.mjs`): 0 violations over 40 source files, 44 dist files and computed styles of 17 pages.
- Lighthouse 13 (local, `scripts/lighthouse.mjs`): see `07-lighthouse/summary.md`.
- Bugs found by these checks and fixed: quote step could swallow the «Далее» click (blur-validation shifted the layout
  between mousedown and mouseup); three.js was downloaded on reduced-motion devices (capability check lived in the
  three.js module); 3D ran on software-rendered WebGL (now falls back to the static render); muted text 4.49:1 on
  deep panels; logo link name mismatch; heading order on /portfolio/; long Russian word overflowing the mobile H1 on
  the privacy page; hero readout overlapping the spec label at narrow stage widths.

## Not covered here

- Safari/WebKit: cannot launch on this VPS (missing system libraries). Chromium and the static fallback path were tested.
- Real GPU phones: 3D was tested in software rendering with `?3d=1`; on real devices it runs only when WebGL is
  hardware-accelerated and the device is not low-end.
- Field performance (CrUX/PSI): not measurable before deployment.
