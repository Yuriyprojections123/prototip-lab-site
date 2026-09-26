"""Regrade the studio's published images into the «Грунт и графит» palette.

The old images carry the old theme's violet light. Pixels in the violet/blue hue band lose almost all
saturation (they become neutral grey, like primer), the whole frame gets a slight warm shift toward
--c-primer and a gentle contrast lift. Source: legacy/assets/*.webp → src/assets/photos/*.webp.
Pure PIL, no numpy.
"""
from pathlib import Path
from PIL import Image, ImageChops, ImageEnhance

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'legacy' / 'assets'
DST = ROOT / 'src' / 'assets' / 'photos'
DST.mkdir(parents=True, exist_ok=True)

# PIL HSV hue is 0..255. Violet/blue band ≈ 205°..320° → 145..227.
LO, HI = 145, 227
# keep 6% of the saturation inside the band, all of it outside
band = [255 if LO <= h <= HI else 0 for h in range(256)]

for src in sorted(SRC.glob('*.webp')):
    im = Image.open(src).convert('RGB')
    h, s, v = im.convert('HSV').split()
    mask = h.point(band)
    s_low = s.point(lambda x: int(x * 0.06))
    s2 = Image.composite(s_low, s.point(lambda x: int(x * 0.85)), mask)
    out = Image.merge('HSV', (h, s2, v)).convert('RGB')
    # warm primer cast: multiply by primer tone at low strength
    warm = Image.new('RGB', out.size, (244, 240, 230))
    out = ImageChops.multiply(out, warm)
    out = ImageEnhance.Contrast(out).enhance(1.06)
    out.save(DST / src.name, 'WEBP', quality=82, method=6)
    print(src.name, '→', (DST / src.name).stat().st_size // 1024, 'KB')
