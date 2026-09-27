"""Regrade the studio's published images into the «Спектр» palette.

The old images carry the old theme's violet accent light (visor glow, crystal awards, scanner laser).
Pixels in the violet/blue hue band are rotated to the filament colour of the image's service, with a
saturation lift, so every photo keeps its neutral studio grey and gains one colour accent that matches
its service card. Source: legacy/assets/*.webp → src/assets/photos/*.webp. Pure PIL, no numpy.
"""
from pathlib import Path
from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'legacy' / 'assets'
DST = ROOT / 'src' / 'assets' / 'photos'
DST.mkdir(parents=True, exist_ok=True)

# filament hues in degrees — keep in sync with src/styles/tokens.css
HUE = {'cyan': 194, 'blue': 226, 'magenta': 332, 'orange': 21, 'yellow': 45, 'lime': 75}
TARGET = {
    'helmet': 'lime', 'cosplay': 'lime',
    'award': 'orange', 'merch': 'orange',
    'part': 'cyan', 'scanner': 'cyan',
    'figurine': 'magenta',
    'modeling': 'blue', 'hero-studio': 'blue', 'studio': 'blue',
    'prototype': 'yellow',
}

# PIL HSV hue is 0..255. Violet/blue band ≈ 205°..320° → 145..227.
LO, HI = 145, 227
band = [255 if LO <= h <= HI else 0 for h in range(256)]

for src in sorted(SRC.glob('*.webp')):
    if src.stem == 'favicon':
        continue
    key = next((k for k in TARGET if src.stem.startswith(k)), 'blue')
    tgt = round(HUE[TARGET[key]] / 360 * 255)
    im = Image.open(src).convert('RGB')
    h, s, v = im.convert('HSV').split()
    mask = h.point(band)
    h2 = Image.composite(Image.new('L', im.size, tgt), h, mask)
    s2 = Image.composite(s.point(lambda x: min(255, int(x * 1.25))), s.point(lambda x: int(x * 0.7)), mask)
    out = Image.merge('HSV', (h2, s2, v)).convert('RGB')
    out = ImageEnhance.Contrast(out).enhance(1.05)
    out.save(DST / src.name, 'WEBP', quality=82, method=6)
    print(src.name, '→', TARGET[key], (DST / src.name).stat().st_size // 1024, 'KB')
