# ❌ Beim Hochladen nur eine Textseite?

## Problem
Nach **Upload** (Vercel oder Galerie/Veröffentlichen) siehst du nur eine **Textseite** statt der Galerie-App.

## Ursache (fast immer)
Es wurde der **falsche Ordner** hochgeladen:
- ❌ **Projektordner** `k2Galerie` (oder nur `index.html` aus dem Projekt)
- ✅ Es muss der **Build-Ordner** `dist` sein

Wenn der **Projektordner** hochgeladen wird, liefert der Server die **Quell-**`index.html`. Darin steht z.B. `/src/main.tsx` – diese Datei gibt es auf dem Server so nicht, das JavaScript lädt nicht → nur statischer Text/HTML sichtbar.

---

## ✅ Lösung

### Wenn du per **Upload** (z.B. Vercel) hochlädst

1. **Build erzeugen** (im Projektordner, Terminal):
   ```bash
   cd ~/k2Galerie
   npm run build
   ```
2. **Nur den Ordner `dist` hochladen**
   - Im Finder: `k2Galerie` öffnen → Ordner **`dist`** auswählen (nicht das ganze Projekt).
   - Diesen **`dist`**-Ordner bei Vercel in den Upload-Bereich ziehen.
3. In `dist` müssen drin sein:
   - `index.html`
   - Ordner **`assets/`** (mit `.js` und `.css` Dateien)
   - `gallery-data.json`, `manifest.json` usw.

### Wenn du per **Git** deployst (Vercel baut selbst)

- Vercel muss **Output Directory: `dist`** haben (in den Projekteinstellungen).
- Build Command: `npm run build`.
- Dann liefert Vercel automatisch den Inhalt von `dist` – da ist die richtige `index.html` mit den gebauten Dateien aus `assets/`.

---

## Kurz

- **„Nur Textseite“** = meist **falscher Ordner** (Projekt statt `dist`).
- **Immer den Ordner `dist`** (nach `npm run build`) hochladen bzw. von Vercel bauen lassen.
