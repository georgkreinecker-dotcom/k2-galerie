# Schwarzer Bildschirm – Seite lädt nicht

## Typisch nach größeren Änderungen

Wenn die App nur noch **schwarz** anzeigt und nichts lädt, prüfe:

### 1. Build prüfen
```bash
cd ~/k2Galerie
npm run build
```
- **Fehler (z. B. "Cannot find module")** → oft **falscher Importpfad**. Komponenten aus `src/` mit `./...` importieren (z. B. `./components/Ok2ThemeWrapper`), Komponenten aus dem Projektroot mit `../...` (z. B. `../components/ScreenshotExportAdmin`).
- **Build läuft durch** → Fehler kann zur Laufzeit liegen (Browser-Konsole: F12 → Console).

### 2. Browser-Konsole
- **F12** oder **Cmd+Option+I** → Tab **Console**.
- Rote Fehlermeldungen zeigen oft die fehlende Datei oder den Absturz.

### 3. Häufige Ursachen
- **Falscher Importpfad** (Modul nicht gefunden) → schwarzer Bildschirm, weil die App nicht startet.
- **Neue Komponente** mit Fehler im ersten Render → React bricht ab, nur Hintergrund sichtbar.
- **CSS-Variablen** per inline-`style` mit `...object` gesetzt → in manchen Setups problematisch; besser **CSS-Klasse** in `index.css` nutzen (z. B. `.ok2-theme`).

### 4. Schnell-Check nach Änderungen
Nach größeren Änderungen immer einmal:
```bash
npm run build
```
Wenn der Build fehlschlägt, zuerst den angezeigten Fehler beheben (meist Import oder Tippfehler).

---

**Zuletzt behoben (Feb 2026):** Falscher Import in `App.tsx`: `../components/Ok2ThemeWrapper` → `./components/Ok2ThemeWrapper`, weil die Datei unter `src/components/` liegt.
