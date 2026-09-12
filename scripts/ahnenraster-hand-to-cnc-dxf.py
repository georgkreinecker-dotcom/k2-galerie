#!/usr/bin/env python3
"""
Ahnenraster → CNC-DXF (140 × 220 mm)

Quelle: public/100-generation/referenzen/ahnenraster-hand-ohne-raster.png
  Weiß / Orange = Steg (bleibt erhaben)
  Schwarz       = Rille (wird ausgefräst)
  Orange        = Stopp-Marken (eigene Layer)

Einheiten: mm · Ursprung unten links · Y nach oben (CAD).
"""

from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public/100-generation/referenzen/ahnenraster-hand-ohne-raster.png"
OUT_DIR = ROOT / "public/100-generation/cnc"
OUT_DXF = OUT_DIR / "ahnenraster-matrize-140x220.dxf"
OUT_SVG = OUT_DIR / "ahnenraster-matrize-140x220.svg"
OUT_PREVIEW = OUT_DIR / "ahnenraster-matrize-vorschau.png"
OUT_META = OUT_DIR / "ahnenraster-matrize-meta.json"
OUT_README = OUT_DIR / "CNC-MATRIZE-LESEN.txt"

WIDTH_MM = 140.0
HEIGHT_MM = 220.0
CELL_MM = 2.0
COLS = 70
ROWS = 110


def classify(r: int, g: int, b: int) -> str:
    if r > 180 and g < 130 and b < 90:
        return "orange"
    if (r + g + b) / 3.0 > 150:
        return "white"
    return "black"


def load_grid(path: Path) -> tuple[list[list[str]], list[tuple[int, int]]]:
    im = Image.open(path).convert("RGB")
    w, h = im.size
    cw, ch = w // COLS, h // ROWS
    grid: list[list[str]] = []
    stops: list[tuple[int, int]] = []
    for gy in range(ROWS):
        row: list[str] = []
        for gx in range(COLS):
            x = gx * cw + cw // 2
            y = gy * ch + ch // 2
            k = classify(*im.getpixel((x, y)))
            row.append(k)
            if k == "orange":
                stops.append((gx, gy))
        grid.append(row)
    return grid, stops


def is_mill(kind: str) -> bool:
    """Schwarz = Rille = fräsen."""
    return kind == "black"


def cell_to_xy_up(gx: int, gy: int) -> tuple[float, float, float, float]:
    """Zellgrenzen in mm, Y nach oben. gy=0 = Bild oben = CAD oben."""
    left = gx * CELL_MM
    right = (gx + 1) * CELL_MM
    top = HEIGHT_MM - gy * CELL_MM
    bottom = HEIGHT_MM - (gy + 1) * CELL_MM
    return left, bottom, right, top


def collect_edge_segments(grid: list[list[str]]) -> list[tuple[tuple[float, float], tuple[float, float]]]:
    """Außenkanten der Rillen-Zellen (Nachbar nicht Rille)."""
    segs: list[tuple[tuple[float, float], tuple[float, float]]] = []

    def mill_at(gx: int, gy: int) -> bool:
        if gx < 0 or gy < 0 or gx >= COLS or gy >= ROWS:
            return False
        return is_mill(grid[gy][gx])

    for gy in range(ROWS):
        for gx in range(COLS):
            if not mill_at(gx, gy):
                continue
            left, bottom, right, top = cell_to_xy_up(gx, gy)
            # Norden (Bild oben = gy-1) → Kante bei y=top
            if not mill_at(gx, gy - 1):
                segs.append(((left, top), (right, top)))
            # Süden
            if not mill_at(gx, gy + 1):
                segs.append(((left, bottom), (right, bottom)))
            # Westen
            if not mill_at(gx - 1, gy):
                segs.append(((left, bottom), (left, top)))
            # Osten
            if not mill_at(gx + 1, gy):
                segs.append(((right, bottom), (right, top)))
    return segs


def chain_polylines(
    segs: list[tuple[tuple[float, float], tuple[float, float]]],
) -> list[list[tuple[float, float]]]:
    """Segmente zu geschlossenen/offenen Polylinien ketten."""
    key = lambda p: (round(p[0], 6), round(p[1], 6))
    adj: dict[tuple[float, float], list[tuple[float, float]]] = defaultdict(list)
    for a, b in segs:
        ka, kb = key(a), key(b)
        adj[ka].append(kb)
        adj[kb].append(ka)

    unused: set[tuple[tuple[float, float], tuple[float, float]]] = set()
    for a, b in segs:
        ka, kb = key(a), key(b)
        e = (ka, kb) if ka <= kb else (kb, ka)
        unused.add(e)

    polys: list[list[tuple[float, float]]] = []

    def take_edge(u: tuple[float, float], v: tuple[float, float]) -> bool:
        e = (u, v) if u <= v else (v, u)
        if e in unused:
            unused.remove(e)
            return True
        return False

    while unused:
        u0, v0 = next(iter(unused))
        take_edge(u0, v0)
        path = [u0, v0]
        # vorwärts
        while True:
            cur = path[-1]
            prev = path[-2]
            nxts = [n for n in adj[cur] if n != prev and take_edge(cur, n)]
            if not nxts:
                # zurücklegen fehlgeschlagen – nimm erste ungenutzte Kante von cur
                found = False
                for n in adj[cur]:
                    if n == prev:
                        continue
                    e = (cur, n) if cur <= n else (n, cur)
                    if e in unused:
                        unused.remove(e)
                        path.append(n)
                        found = True
                        break
                if not found:
                    break
            else:
                path.append(nxts[0])
            if path[-1] == path[0]:
                break
        # rückwärts verlängern falls offen
        if path[0] != path[-1]:
            while True:
                cur = path[0]
                nxt = path[1]
                found = False
                for n in adj[cur]:
                    if n == nxt:
                        continue
                    e = (cur, n) if cur <= n else (n, cur)
                    if e in unused:
                        unused.remove(e)
                        path.insert(0, n)
                        found = True
                        break
                if not found:
                    break
                if path[0] == path[-1]:
                    break
        polys.append(path)
    return polys


def merge_collinear(poly: list[tuple[float, float]]) -> list[tuple[float, float]]:
    if len(poly) < 3:
        return poly
    closed = poly[0] == poly[-1]
    pts = poly[:-1] if closed else list(poly)
    if len(pts) < 3:
        return poly
    out = [pts[0]]
    for i in range(1, len(pts) - 1):
        ax, ay = out[-1]
        bx, by = pts[i]
        cx, cy = pts[i + 1]
        if abs((bx - ax) * (cy - by) - (by - ay) * (cx - bx)) < 1e-9:
            continue
        out.append(pts[i])
    out.append(pts[-1])
    if closed:
        # letzter→erster kollinear?
        if len(out) >= 3:
            ax, ay = out[-2]
            bx, by = out[-1]
            cx, cy = out[0]
            dx, dy = out[1]
            # drop out[-1] if collinear with out[-2] and out[0]
            if abs((bx - ax) * (cy - by) - (by - ay) * (cx - bx)) < 1e-9:
                out.pop()
            # drop out[0] if collinear closing
            if len(out) >= 3:
                ax, ay = out[-1]
                bx, by = out[0]
                cx, cy = out[1]
                if abs((bx - ax) * (cy - by) - (by - ay) * (cx - bx)) < 1e-9:
                    out.pop(0)
        out.append(out[0])
    return out


def write_dxf(
    path: Path,
    rille_polys: list[list[tuple[float, float]]],
    stops: list[tuple[int, int]],
) -> None:
    lines: list[str] = []

    def w(*vals: object) -> None:
        for v in vals:
            lines.append(str(v))

    w(0, "SECTION", 2, "HEADER")
    w(9, "$INSUNITS", 70, 4)  # mm
    w(9, "$MEASUREMENT", 70, 1)
    w(0, "ENDSEC")

    w(0, "SECTION", 2, "TABLES")
    w(0, "TABLE", 2, "LAYER", 70, 4)
    for name, color in (
        ("PLATTE", 7),
        ("RILLE", 1),
        ("STOPP", 30),
        ("INFO", 3),
    ):
        w(0, "LAYER", 2, name, 70, 0, 62, color, 6, "CONTINUOUS")
    w(0, "ENDTAB", 0, "ENDSEC")

    w(0, "SECTION", 2, "ENTITIES")

    # Außenkontur
    plate = [(0.0, 0.0), (WIDTH_MM, 0.0), (WIDTH_MM, HEIGHT_MM), (0.0, HEIGHT_MM), (0.0, 0.0)]
    w(0, "POLYLINE", 8, "PLATTE", 66, 1, 70, 1)
    for x, y in plate:
        w(0, "VERTEX", 8, "PLATTE", 10, f"{x:.4f}", 20, f"{y:.4f}", 30, "0.0")
    w(0, "SEQEND")

    for poly in rille_polys:
        if len(poly) < 2:
            continue
        closed = 1 if poly[0] == poly[-1] else 0
        w(0, "POLYLINE", 8, "RILLE", 66, 1, 70, closed)
        pts = poly[:-1] if closed else poly
        for x, y in pts:
            w(0, "VERTEX", 8, "RILLE", 10, f"{x:.4f}", 20, f"{y:.4f}", 30, "0.0")
        w(0, "SEQEND")

    # Stopps = 1 mm Quadrat um Zellmitte
    for gx, gy in stops:
        left, bottom, right, top = cell_to_xy_up(gx, gy)
        cx = (left + right) / 2
        cy = (bottom + top) / 2
        s = 0.5
        sq = [
            (cx - s, cy - s),
            (cx + s, cy - s),
            (cx + s, cy + s),
            (cx - s, cy + s),
            (cx - s, cy - s),
        ]
        w(0, "POLYLINE", 8, "STOPP", 66, 1, 70, 1)
        for x, y in sq:
            w(0, "VERTEX", 8, "STOPP", 10, f"{x:.4f}", 20, f"{y:.4f}", 30, "0.0")
        w(0, "SEQEND")

    w(0, "TEXT", 8, "INFO", 10, "4", 20, "214", 30, "0.0", 40, "2.5", 1, "Ahnenraster 140x220 mm - RILLE=fraesen WEISS=Steg")
    w(0, "ENDSEC", 0, "EOF")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_svg(
    path: Path,
    rille_polys: list[list[tuple[float, float]]],
    stops: list[tuple[int, int]],
) -> None:
    parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH_MM}mm" height="{HEIGHT_MM}mm" viewBox="0 0 {WIDTH_MM} {HEIGHT_MM}">',
        "<title>Ahnenraster CNC Matrize 140x220</title>",
        f'<rect width="{WIDTH_MM}" height="{HEIGHT_MM}" fill="#111" stroke="#888" stroke-width="0.3"/>',
    ]
    # SVG Y nach unten → CAD Y umrechnen: sy = HEIGHT - y
    for poly in rille_polys:
        if len(poly) < 2:
            continue
        pts = " ".join(f"{x:.3f},{HEIGHT_MM - y:.3f}" for x, y in poly)
        parts.append(f'<polyline points="{pts}" fill="none" stroke="#e33" stroke-width="0.25"/>')
    for gx, gy in stops:
        left, bottom, right, top = cell_to_xy_up(gx, gy)
        cx = (left + right) / 2
        cy_svg = HEIGHT_MM - (bottom + top) / 2
        parts.append(f'<rect x="{cx - 0.5:.3f}" y="{cy_svg - 0.5:.3f}" width="1" height="1" fill="#f80"/>')
    parts.append("</svg>")
    path.write_text("\n".join(parts) + "\n", encoding="utf-8")


def write_preview(path: Path, grid: list[list[str]]) -> None:
    scale = 8
    im = Image.new("RGB", (COLS * scale, ROWS * scale), (0, 0, 0))
    dr = ImageDraw.Draw(im)
    for gy in range(ROWS):
        for gx in range(COLS):
            k = grid[gy][gx]
            if k == "black":
                c = (20, 20, 20)
            elif k == "orange":
                c = (240, 120, 40)
            else:
                c = (245, 245, 245)
            x0, y0 = gx * scale, gy * scale
            dr.rectangle([x0, y0, x0 + scale - 1, y0 + scale - 1], fill=c)
    # Plattenrahmen
    dr.rectangle([0, 0, COLS * scale - 1, ROWS * scale - 1], outline=(180, 180, 180))
    im.save(path, "PNG")


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    grid, stops = load_grid(SRC)
    n_w = sum(1 for row in grid for k in row if k == "white")
    n_b = sum(1 for row in grid for k in row if k == "black")
    n_o = len(stops)

    segs = collect_edge_segments(grid)
    raw = chain_polylines(segs)
    polys = [merge_collinear(p) for p in raw]
    polys = [p for p in polys if len(p) >= 4]

    write_dxf(OUT_DXF, polys, stops)
    write_svg(OUT_SVG, polys, stops)
    write_preview(OUT_PREVIEW, grid)

    meta = {
        "source": str(SRC.relative_to(ROOT)),
        "widthMm": WIDTH_MM,
        "heightMm": HEIGHT_MM,
        "cellMm": CELL_MM,
        "grid": [COLS, ROWS],
        "cellsWhite": n_w,
        "cellsBlackRille": n_b,
        "cellsStopp": n_o,
        "rillePolylines": len(polys),
        "edgeSegments": len(segs),
        "layers": {
            "PLATTE": "Außenkontur 140x220",
            "RILLE": "geschlossene Konturen der schwarzen Zwischenräume (fräsen)",
            "STOPP": "1 mm Quadrate an orangen Marken",
            "INFO": "Hinweistext",
        },
        "polarity": "weiss+orange=Steg erhaben · schwarz=Rille",
        "units": "mm, origin bottom-left, Y up",
    }
    OUT_META.write_text(json.dumps(meta, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    OUT_README.write_text(
        "\n".join(
            [
                "CNC-Matrize Ahnenraster",
                "======================",
                "",
                "Datei: ahnenraster-matrize-140x220.dxf",
                "Quelle: referenzen/ahnenraster-hand-ohne-raster.png (letztes Hand-Bild vom Code)",
                "Maß: 140 × 220 mm · Zelle 2 mm · 70 × 110",
                "",
                "Layer:",
                "  PLATTE – Außenkontur",
                "  RILLE  – Konturen der schwarzen Zwischenräume → ausfräsen",
                "  STOPP  – orange Marken (1 mm Quadrate)",
                "  INFO   – Text",
                "",
                "Polarität: Weiß/Orange = erhabener Steg · Schwarz = Rille",
                "",
                "Vor dem Fräsen: in CAM öffnen, Maßstab mm prüfen, Probe.",
                "Georg entscheidet Freigabe – Zeichnung = Näherung aus Hand-Raster.",
                "",
                "Neu erzeugen:",
                "  python3 scripts/ahnenraster-hand-to-cnc-dxf.py",
                "",
            ]
        ),
        encoding="utf-8",
    )

    print(f"OK DXF → {OUT_DXF.relative_to(ROOT)}")
    print(f"  Rille-Polylinien: {len(polys)}  Segmente: {len(segs)}")
    print(f"  Zellen W/B/O: {n_w}/{n_b}/{n_o}")
    print(f"  Preview → {OUT_PREVIEW.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
