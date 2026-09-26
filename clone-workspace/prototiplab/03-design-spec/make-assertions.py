"""Emit assertions.json from the DESIGN.md tokens.

Selector keys: `[@<viewport-width>] [!focus] <route> <css selector>`.
Default viewport is 1440x900. `!focus` keyboard-focuses the element before reading.
Values are the computed serialisations Chromium returns for the DESIGN.md tokens at that width.
"""
import json
from pathlib import Path

G = 'rgb(20, 20, 19)'        # --c-graphite (brand)
P = 'rgb(228, 227, 222)'     # --c-primer (brand)
PD = 'rgb(211, 210, 204)'    # --c-primer-deep (brand)
A = 'rgb(255, 90, 31)'       # --c-amber (brand)
SANS = '"Geologica Variable", Geologica, system-ui, sans-serif'
MONO = '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, monospace'
EXPO = 'cubic-bezier(0.19, 1, 0.22, 1)'          # --ease-out (reference)
SINE = 'cubic-bezier(0.39, 0.575, 0.565, 1)'     # --ease-hover (reference)

out = []


def add(sel, **props):
    for prop, expected in props.items():
        out.append({"selector": sel, "prop": prop, "expected": expected})


# home @1440
add('/ body', backgroundColor=P, color=G, fontFamily=SANS, fontSize='16px', lineHeight='24px')
add('/ h1.t-display', fontSize='70px', fontWeight='400', lineHeight='66.5px', letterSpacing='-3.5px', color=G)
add('/ .t-h2', fontSize='48px', fontWeight='400', lineHeight='50.4px', letterSpacing='-0.96px')
add('/ .t-lead', fontSize='34.56px', fontWeight='450')
add('/ .t-label', fontFamily=MONO, fontSize='12px', fontWeight='600', textTransform='uppercase', letterSpacing='1.92px')
add('/ .site-header .t-nav', fontSize='14px', fontWeight='450', letterSpacing='0.42px')
add('/ .site-header', backdropFilter='none', boxShadow='none')
add('/ .wrap', paddingLeft='70px', paddingRight='70px')
add('/ .grid-12', columnGap='15px')
add('/ .btn--signal', backgroundColor=A, color=G, borderRadius='2px', cursor='pointer', boxShadow='none',
    fontFamily=MONO, fontSize='13px', fontWeight='600', letterSpacing='1.82px', textTransform='uppercase',
    transitionTimingFunction=SINE, transitionDuration='0.3s')
add('/404.html .btn--ghost', color=G, borderRadius='2px', cursor='pointer')
add('/ .chapter--dark .btn--ghost', color=P, borderRadius='2px')
add('/ .chapter--dark', backgroundColor=G, color=P)
add('/ .chapter.svc', paddingTop='120px', paddingBottom='120px')
add('/ .reveal-line > span', transitionTimingFunction=EXPO, transitionDuration='1s')
add('/ .hero-state[aria-pressed="true"]', backgroundColor=G, color=P, borderRadius='2px')
add('/ .compare', borderRadius='0px')
add('/ .site-footer', backgroundColor=G, color=P)
add('!focus / .btn--signal', outlineColor=A, outlineWidth='2px', outlineOffset='3px')
# inner pages @1440
add('/uslugi/ h1.t-display', fontSize='70px', letterSpacing='-3.5px')
add('/uslugi/ .service-row', borderRadius='0px', boxShadow='none')
add('/uslugi/skanirovanie/ h1.t-display', fontSize='70px')
add('/portfolio/ .filter-chip', borderRadius='2px', fontFamily=MONO, cursor='pointer')
add('/portfolio/ .filter-chip[aria-pressed="true"]', backgroundColor=G, color=P)
add('/portfolio/ .case-card', borderRadius='0px', boxShadow='none')
add('/portfolio/shlem-po-skanu/ h1.t-display', fontSize='70px')
add('/raschet/ .q-input', backgroundColor=PD, borderRadius='0px', fontSize='18px')
add('/raschet/ .q-option', borderRadius='2px', cursor='pointer')
add('/raschet/ .q-consent a', color=G, textDecorationLine='underline')
add('/politika-konfidencialnosti/ h1.t-display', fontSize='70px')
# mobile @390
add('@390 / h1.t-display', fontSize='40px', lineHeight='38px', letterSpacing='-2px')
add('@390 / .wrap', paddingLeft='20px')
add('@390 / .t-h2', fontSize='32px')
add('@390 / .btn--signal', fontSize='13px', borderRadius='2px')
add('@390 /raschet/ .q-input', fontSize='18px')

Path(__file__).with_name('assertions.json').write_text(json.dumps(out, indent=1, ensure_ascii=False))
print(len(out), 'assertions')
