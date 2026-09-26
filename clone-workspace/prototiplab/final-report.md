# Final report — v2 «Спектр» — CONVERGED-PASS

Gate (contract §5): `style_assertions.failed == 0` AND `npm run build` exits 0.

| Cycle | Assertions | Failed | What changed |
|---|---|---|---|
| v2-1 | 132 | 1 | `/404.html .btn--ghost` matched the ghost pill inside the (hidden, dark) menu. Selector pinned to `.nf__actions .btn--ghost` — no token or CSS value changed |
| v2-2 | 132 | **0** | — |
| final (`npm run qa`) | 132 | **0** | against `npm run preview` |

Build: `astro build` → 17 pages, exit 0.

## Beyond the gate

- Interaction coverage (`scripts/e2e.mjs`): **36/36**, three consecutive runs — hero modes and layer counter,
  compare slider (keyboard), table toggle, pinned process, mobile menu (focus trap, Esc), portfolio filter + `?cat=`,
  quote flow (validation, files, summary, consent, offline/success/error, multipart payload), reduced motion without
  three.js, legacy URL forward, no external requests, no JS errors.
- Banned patterns v2 (`scripts/check-banned.mjs`): 0 violations over 39 source files, 45 dist files and computed
  styles of 17 pages — including the new rule #7 (no boxy controls or surfaces).
- Horizontal overflow: none at 360 / 390 / 768 / 1024 / 1920 on all 17 pages.
- Lighthouse 13 (local): performance 94–100 mobile, 100 desktop; accessibility, best practices, SEO 100 on
  home, services, a service, portfolio, a case, studio, contacts, quote, privacy.
- Bugs found by these checks and fixed: white-on-blue process text at 85 % opacity (4.16:1) → full opacity;
  quote step slid in from +24 px, which widened the mobile layout viewport at 360 px → vertical rise; header pills
  2 px too wide at 360 px; comparison table forced its grid track wider at 360 px; menu service chips fog-on-paper.
- Test harness: the quote flow and compare slider raced smooth scrolling and software-GL frame times in headless
  Chromium → the test waits for the settled state instead of fixed delays.

## Not covered here

- Safari/WebKit: cannot launch on this VPS. Chromium and the static fallback path were tested.
- Real GPU phones: 3D was tested in software rendering with `?3d=1`; on real devices it runs only when WebGL is
  hardware-accelerated and the device is not low-end — otherwise the pre-rendered still is shown.
