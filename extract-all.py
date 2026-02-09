import json
import os
from pathlib import Path

OUT_FILE = "k2-export.json"

home = Path.home()
desktop_default = home / "Desktop" / "k2-export.json"
k2_galerie_dir = home / "Desktop" / "K2 Galerie"

def find_source_path():
    if desktop_default.exists():
        return desktop_default
    if k2_galerie_dir.exists():
        json_files = sorted([p for p in k2_galerie_dir.glob("*.json")])
        for p in json_files:
            name = p.name.upper()
            if "KOMPLETTER" in name or "CODE" in name or "EXPORT" in name:
                return p
        if json_files:
            return json_files[0]
    raise FileNotFoundError("Kein Export gefunden.")

def main():
    source = find_source_path()
    print("Lese Export von:", source)

    data = json.loads(source.read_text(encoding="utf8"))
    Path(OUT_FILE).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf8")
    print("Gespeichert als:", OUT_FILE)

    total = data.get("meta", {}).get("totalFiles", len(data.get("files", [])))
    print(f"Extrahiere {total} Dateien...")
    for i, file in enumerate(data.get("files", []), 1):
        file_path = Path(file["path"])
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_text(file.get("content", ""), encoding="utf8")
        print(f"✅ [{i}/{total}] {file_path}")

    print("Fertig! Alle Dateien extrahiert.")

if __name__ == "__main__":
    main()
