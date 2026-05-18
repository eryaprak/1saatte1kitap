#!/usr/bin/env python3
"""Generate 1 Saatte 1 Kitap 1024 App Store icon — open book + 1 hour on VoxDuru blue."""
from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

SIZE = 1024
ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
IOS_ICON_DIR = ROOT / "ios" / "1Saatte1Kitap" / "Images.xcassets" / "AppIcon.appiconset"

# App primary #2563EB + deeper gradient (VoxDuru / eryaprak family)
BG_TOP = (59, 130, 246)
BG_BOTTOM = (29, 78, 216)
GRID = (147, 197, 253, 42)
BOOK_COVER = (255, 251, 235)
BOOK_PAGE = (254, 252, 248)
BOOK_SHADOW = (15, 23, 42, 95)
SPINE = (217, 119, 6)
CLOCK_FACE = (255, 255, 255)
CLOCK_HAND = (37, 99, 235)
ACCENT_GLOW = (251, 191, 36, 90)


def lerp(a: int, b: int, t: float) -> int:
    return int(a + (b - a) * t)


def vertical_gradient(size: int) -> Image.Image:
    img = Image.new("RGB", (size, size))
    px = img.load()
    for y in range(size):
        t = y / (size - 1)
        r = lerp(BG_TOP[0], BG_BOTTOM[0], t)
        g = lerp(BG_TOP[1], BG_BOTTOM[1], t)
        b = lerp(BG_TOP[2], BG_BOTTOM[2], t)
        for x in range(size):
            px[x, y] = (r, g, b)
    return img


def draw_grid(base: Image.Image) -> None:
    d = ImageDraw.Draw(base, "RGBA")
    step = base.size[0]
    grid_step = step // 16
    for i in range(0, step + 1, grid_step):
        d.line([(i, 0), (i, step)], fill=GRID, width=1)
        d.line([(0, i), (step, i)], fill=GRID, width=1)


def rounded_rect(
    d: ImageDraw.ImageDraw,
    box: tuple[float, float, float, float],
    radius: float,
    fill,
    outline=None,
    width: int = 0,
) -> None:
    d.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def draw_open_book(base: Image.Image) -> tuple[Image.Image, int, int]:
    w, h = base.size
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    cx, cy = w // 2, int(h * 0.52)
    spread = int(w * 0.38)
    page_h = int(h * 0.34)
    y0 = cy - page_h // 2
    y1 = cy + page_h // 2
    rad = int(w * 0.04)

    shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.polygon(
        [
            (cx - spread + 14, y0 + 18),
            (cx + spread + 14, y0 + 18),
            (cx + spread + 8, y1 + 20),
            (cx - spread + 8, y1 + 20),
        ],
        fill=BOOK_SHADOW,
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(14))
    out = Image.alpha_composite(base.convert("RGBA"), shadow)

    left = [
        (cx - 8, y0),
        (cx - spread, y0 + int(page_h * 0.08)),
        (cx - spread + 12, y1),
        (cx - 8, y1 - int(page_h * 0.06)),
    ]
    d.polygon(left, fill=BOOK_PAGE + (255,))
    rounded_rect(d, (cx - spread + 6, y0 + 12, cx - 28, y1 - 16), rad, BOOK_COVER + (255,))

    right = [
        (cx + 8, y0),
        (cx + spread, y0 + int(page_h * 0.08)),
        (cx + spread - 12, y1),
        (cx + 8, y1 - int(page_h * 0.06)),
    ]
    d.polygon(right, fill=BOOK_PAGE + (255,))
    rounded_rect(d, (cx + 28, y0 + 12, cx + spread - 6, y1 - 16), rad, BOOK_COVER + (255,))

    d.polygon([(cx - 10, y0), (cx + 10, y0), (cx + 8, y1), (cx - 8, y1)], fill=SPINE + (255,))

    for x_start, x_end in ((cx - spread + 36, cx - 40), (cx + 40, cx + spread - 36)):
        for i in range(4):
            ly = y0 + page_h * (0.22 + i * 0.16)
            d.line([(x_start, ly), (x_end, ly)], fill=(226, 232, 240, 200), width=2)

    return Image.alpha_composite(out, layer), cx, cy


def draw_hour_badge(base: Image.Image, cx: int, cy: int) -> Image.Image:
    w, h = base.size
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    r = int(w * 0.155)
    badge_cy = cy - int(h * 0.2)

    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((cx - r - 8, badge_cy - r - 8, cx + r + 8, badge_cy + r + 8), fill=ACCENT_GLOW)
    glow = glow.filter(ImageFilter.GaussianBlur(10))

    d.ellipse((cx - r, badge_cy - r, cx + r, badge_cy + r), fill=CLOCK_FACE + (255,))
    d.ellipse(
        (cx - r, badge_cy - r, cx + r, badge_cy + r),
        outline=(226, 232, 240, 255),
        width=max(3, r // 24),
    )

    tick_r = r - max(8, r // 8)
    for angle_deg in (0, 90, 180, 270):
        ang = math.radians(angle_deg - 90)
        tx = cx + tick_r * math.cos(ang)
        ty = badge_cy + tick_r * math.sin(ang)
        d.ellipse((tx - 4, ty - 4, tx + 4, ty + 4), fill=(203, 213, 225, 255))

    hand_len = int(r * 0.42)
    d.line([(cx, badge_cy), (cx, badge_cy - hand_len)], fill=CLOCK_HAND + (255,), width=max(4, r // 18))
    d.line(
        [(cx, badge_cy), (cx + int(hand_len * 0.55), badge_cy - int(hand_len * 0.35))],
        fill=CLOCK_HAND + (220,),
        width=max(3, r // 22),
    )

    try:
        font = ImageFont.truetype("/System/Library/Fonts/SFNSRounded.ttf", int(r * 1.05))
    except OSError:
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", int(r * 1.05))
        except OSError:
            font = ImageFont.load_default()

    text = "1"
    bbox = d.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text((cx - tw // 2, badge_cy - th // 2 + int(r * 0.08)), text, fill=(37, 99, 235, 255), font=font)

    return Image.alpha_composite(Image.alpha_composite(base.convert("RGBA"), glow), layer)


def generate() -> Image.Image:
    base = vertical_gradient(SIZE)
    draw_grid(base)
    with_book, cx, cy = draw_open_book(base)
    final = draw_hour_badge(with_book, cx, cy)
    return final.convert("RGB")


def write_assets(img: Image.Image) -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    img.save(ASSETS / "icon.png", format="PNG", optimize=True)
    img.save(ASSETS / "adaptive-icon.png", format="PNG", optimize=True)

    splash_bg = Image.new("RGB", (1284, 2778), (37, 99, 235))
    icon_s = img.resize((512, 512), Image.Resampling.LANCZOS)
    splash_bg.paste(icon_s, ((1284 - 512) // 2, (2778 - 512) // 2))
    splash_bg.save(ASSETS / "splash-icon.png", format="PNG", optimize=True)
    img.resize((48, 48), Image.Resampling.LANCZOS).save(ASSETS / "favicon.png", format="PNG", optimize=True)

    IOS_ICON_DIR.mkdir(parents=True, exist_ok=True)
    ios_name = "App-Icon-1024x1024@1x.png"
    img.save(IOS_ICON_DIR / ios_name, format="PNG", optimize=True)
    contents = {
        "images": [
            {
                "filename": ios_name,
                "idiom": "universal",
                "platform": "ios",
                "size": "1024x1024",
            }
        ],
        "info": {"author": "expo", "version": 1},
    }
    (IOS_ICON_DIR / "Contents.json").write_text(json.dumps(contents, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    icon = generate()
    write_assets(icon)
    print(f"Wrote icons to {ASSETS} and {IOS_ICON_DIR} ({icon.size[0]}x{icon.size[1]} RGB)")
