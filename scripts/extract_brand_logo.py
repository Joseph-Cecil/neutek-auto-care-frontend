"""Crop final Neutek logo assets from the brand board."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

SRC = Path(
    r"C:\Users\josep\.cursor\projects\c-Users-josep-Documents-nuetek\assets"
    r"\WhatsApp_Image_2026-11-01_at_7.43.58_AM-81f8b661-fc25-47fc-a279-fef6fdfd7dec.jpg"
)
OUT = Path(__file__).resolve().parents[1] / "public" / "brand"
OUT.mkdir(parents=True, exist_ok=True)

im = Image.open(SRC).convert("RGB")

# Primary horizontal lockup: shield + NEUTEK / AUTOCARE on navy
LOCKUP = (312, 40, 558, 140)
# Shield emblem only (for compact mark)
SHIELD = (316, 46, 396, 134)


def save_asset(name: str, box: tuple[int, int, int, int], scale: float = 2.0) -> None:
    crop = im.crop(box)
    if scale != 1:
        crop = crop.resize(
            (max(1, int(crop.width * scale)), max(1, int(crop.height * scale))),
            Image.Resampling.LANCZOS,
        )
    path = OUT / name
    crop.save(path, optimize=True)
    print(f"wrote {path.name} {crop.size} from {box}")


save_asset("logo-lockup.png", LOCKUP, scale=2.5)
save_asset("logo-mark.png", SHIELD, scale=3.0)

# Remove QA / intermediate files
for path in OUT.iterdir():
    if path.name.startswith("qa-") or path.name == "logo-stacked.png":
        path.unlink(missing_ok=True)
        print("removed", path.name)

print("done")
