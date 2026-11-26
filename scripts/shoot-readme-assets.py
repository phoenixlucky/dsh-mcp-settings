"""Crop the README preview shots to their content and ship them as 1x WebP assets.

Preview pages are rendered at 2x for crisp text; the README only needs 1x, so each shot is
trimmed to its non-white bounding box and halved. Run after `preview-card.mjs` + headless Chrome.
"""

from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path(r"E:\home\dsh-mcp")
SHOTS = {
    "readme-overview.png": "mcp-settings-overview.webp",
    "readme-tools.png": "mcp-settings-tools.webp",
    "readme-resources.png": "mcp-settings-resources.webp",
}

for source, target in SHOTS.items():
    image = Image.open(ROOT / "docs" / "preview" / source).convert("RGB")
    background = Image.new("RGB", image.size, (255, 255, 255))
    box = ImageChops.difference(image, background).getbbox()
    if box is None:
        raise SystemExit(f"{source}: nothing but background")
    left, top, right, bottom = box
    margin = 12
    crop = image.crop(
        (max(0, left - margin), max(0, top - margin), min(image.width, right + margin), min(image.height, bottom + margin))
    )
    # 2x render -> 1x asset, keeping the halving exact to avoid resampling fuzz.
    scaled = crop.resize((crop.width // 2, crop.height // 2), Image.LANCZOS)
    destination = ROOT / "assets" / target
    scaled.save(destination, "WEBP", quality=90, method=6)
    print(f"{target}: {scaled.width}x{scaled.height} {destination.stat().st_size} bytes (crop {crop.size})")
