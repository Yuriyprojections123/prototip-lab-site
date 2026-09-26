"""Emit assertions.json from the DESIGN.md tokens («Спектр», v2).

Selector keys: `[@<viewport-width>] [!focus] <route> <css selector>`.
Default viewport is 1440x900. `!focus` keyboard-focuses the element before reading.
Values are the computed serialisations Chromium returns for the DESIGN.md tokens at that width
(px values are compared ±1px by scripts/assert-styles.mjs).
"""
import json
from pathlib import Path

INK = 'rgb(11, 12, 16)'        # --c-ink (brand)
FOG = 'rgb(237, 239, 244)'     # --c-fog (brand)
PAPER = 'rgb(248, 249, 252)'   # --c-paper (brand)
BLUE = 'rgb(47, 91, 255)'      # --f-blue (brand, focus ring)
SANS = '"Onest Variable", Onest, system-ui, sans-serif'
MONO = '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, monospace'
EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'           # --ease-out (reference)
PILL = '999px'                                   # --r-pill (reference: every control is a pill)
CARD = '28.8px'                                  # --r-card at 1440 = 2vw (reference: soft cards)

out = []


def add(sel, **props):
    for prop, expected in props.items():
        out.append({"selector": sel, "prop": prop, "expected": expected})


# home @1440
add('/ body', backgroundColor=FOG, color=INK, fontFamily=SANS, fontSize='17px', lineHeight='25.5px')
add('/ .hero__title', fontSize='92.16px', fontWeight='350', color=FOG)
add('/ .hero__stage', borderRadius=CARD, color=FOG, overflow='hidden')
add('/ .hero-state[aria-pressed="true"]', backgroundColor=FOG, color=INK, borderRadius=PILL)
add('/ .hero__states', borderRadius=PILL)
add('/ .t-h2', fontSize='59.04px', fontWeight='380', lineHeight='59.04px', letterSpacing='-2.36px')
add('/ .t-label', fontFamily=MONO, fontSize='12px', fontWeight='500', textTransform='uppercase', letterSpacing='0.96px')
add('/ .chip', fontFamily=MONO, fontSize='11px', borderRadius=PILL)
add('/ .site-header .t-nav', fontSize='15px', fontWeight='500')
add('/ .site-header__nav', backgroundColor=PAPER, borderRadius=PILL)
add('/ .site-header', backdropFilter='none')
add('/ .wrap', paddingLeft='31.68px', paddingRight='31.68px')
add('/ .grid-12', columnGap='15.84px')
add('/ .site-header__cta', backgroundColor=INK, color=FOG, borderRadius=PILL, cursor='pointer',
    fontFamily=SANS, fontSize='14px', fontWeight='500', minHeight='44px')
add('/ .hero__actions .btn', borderRadius=PILL, minHeight='52px', fontSize='15px')
add('/ .hero__actions .btn--ghost', borderRadius=PILL, color=INK, backgroundColor='rgba(0, 0, 0, 0)')
add('/ .svc-card', borderRadius=CARD, backgroundColor=PAPER)
add('/ .svc-card__media', borderRadius='20.16px')
add('/ .stmt__item', borderRadius=CARD, backgroundColor=PAPER)
add('/ .chapter.svc', paddingTop='122.4px', paddingBottom='122.4px')
add('/ .chapter--deep', backgroundColor=PAPER, borderRadius=CARD, marginLeft='12.1px')
add('/ .compare__view', borderRadius=CARD)
add('/ .compare__grip', borderRadius=PILL, backgroundColor=FOG)
add('/ .compare__table', borderRadius=CARD, backgroundColor=PAPER)
add('/ .case-card__media', borderRadius=CARD)
add('/ .cta__card', borderRadius=CARD, overflow='hidden')
add('/ .aud__pill', borderRadius=PILL, backgroundColor=PAPER)
add('/ .site-footer', backgroundColor=INK, color=FOG, borderRadius=CARD)
add('/ .reveal-line > span', transitionTimingFunction=EASE, transitionDuration='1.1s')
add('!focus / .site-header__cta', outlineColor=BLUE, outlineWidth='2px', outlineOffset='3px')
# inner pages @1440
add('/uslugi/ h1.t-display', fontSize='80.64px', fontWeight='350', lineHeight='75.8px', letterSpacing='-4.03px')
add('/uslugi/ .phead__crumb', borderRadius=PILL, backgroundColor=PAPER)
add('/uslugi/ .plist__item', borderRadius=CARD)
add('/uslugi/skanirovanie/ h1.t-display', fontSize='80.64px')
add('/uslugi/skanirovanie/ .blk__item', borderRadius=CARD, backgroundColor=PAPER)
add('/uslugi/skanirovanie/ .svc-hero__img', borderRadius=CARD)
add('/uslugi/skanirovanie/ .more__link', borderRadius=CARD)
add('/portfolio/ .filter-chip', borderRadius=PILL, fontFamily=SANS, fontSize='14px', cursor='pointer')
add('/portfolio/ .filter-chip[aria-pressed="true"]', backgroundColor=INK, color=FOG)
add('/portfolio/ .pf__bar', borderRadius=PILL, backgroundColor=PAPER)
add('/portfolio/ .case-card__media', borderRadius=CARD)
add('/portfolio/shlem-po-skanu/ h1.t-display', fontSize='80.64px')
add('/portfolio/shlem-po-skanu/ .case__facts div', borderRadius=CARD)
add('/studiya/ .story__body .t-lead', fontSize='30.96px', fontWeight='400')
add('/kontakty/ .ct__card', borderRadius=CARD, backgroundColor=PAPER)
add('/raschet/ .q-form', borderRadius=CARD, backgroundColor=PAPER)
add('/raschet/ .q-input', backgroundColor=FOG, borderRadius='18px', fontSize='18px')
add('/raschet/ .q-option', borderRadius='20px', cursor='pointer')
add('/raschet/ .q-tick', borderRadius='8px')
add('/raschet/ .q-consent a', color=INK, textDecorationLine='underline')
add('/politika-konfidencialnosti/ h1.t-display', fontSize='80.64px')
add('/politika-konfidencialnosti/ .pol__sec', borderRadius=CARD, backgroundColor=PAPER)
add('/404.html .nf__actions .btn--ghost', color=INK, borderRadius=PILL, cursor='pointer')
# mobile @390
add('@390 / .hero__title', fontSize='44.85px')
add('@390 /uslugi/ h1.t-display', fontSize='40px', lineHeight='37.6px', letterSpacing='-2px')
add('@390 / .wrap', paddingLeft='16px')
add('@390 / .t-h2', fontSize='34px')
add('@390 / .hero__actions .btn', fontSize='15px', borderRadius=PILL, minHeight='52px')
add('@390 / .hero-state', minHeight='40px', borderRadius=PILL)
add('@390 /raschet/ .q-input', fontSize='18px')

Path(__file__).with_name('assertions.json').write_text(json.dumps(out, indent=1, ensure_ascii=False))
print(len(out), 'assertions')
