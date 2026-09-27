"""Compose viewport frames (scripts/shots.mjs with FRAMES=1) into contact sheets for review.
usage: python3 scripts/sheet.py <dir> <slug--viewport> [cols] [scale]"""
import sys
from pathlib import Path
from PIL import Image

d, prefix = Path(sys.argv[1]), sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 4
scale = float(sys.argv[4]) if len(sys.argv) > 4 else 0.33
frames = sorted(d.glob(f'{prefix}-f*.png'))
ims = [Image.open(f).convert('RGB') for f in frames]
w, h = int(ims[0].width * scale), int(ims[0].height * scale)
rows = (len(ims) + cols - 1) // cols
per = 3  # rows per sheet
for s in range(0, rows, per):
    chunk = ims[s * cols:(s + per) * cols]
    r = (len(chunk) + cols - 1) // cols
    sheet = Image.new('RGB', (w * cols + 4 * (cols - 1), h * r + 4 * (r - 1)), 'white')
    for i, im in enumerate(chunk):
        sheet.paste(im.resize((w, h)), ((i % cols) * (w + 4), (i // cols) * (h + 4)))
    out = d / f'{prefix}-sheet{s // per}.jpg'
    sheet.save(out, quality=72)
    print(out)
